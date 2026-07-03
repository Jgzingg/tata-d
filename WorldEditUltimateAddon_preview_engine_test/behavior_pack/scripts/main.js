/**
 * WorldEdit Addon - Main Entry Point
 * Handles initialization and event listeners
 * Compatible with Minecraft Bedrock 1.21.100+ (Custom Command API)
 */

import { world, system, CommandPermissionLevel, CustomCommandParamType } from "@minecraft/server";
import { commandRegistry } from "./commands/CommandRegistry.js";
import { selectionManager } from "./selection/SelectionManager.js";
import { CONFIG, getMessage } from "./config.js";
import { Vector3 } from "./utils/Vector.js";
import { isCreativeMode } from "./utils/GameMode.js";
import { blockRegistry } from "./blocks/BlockRegistry.js";
import { previewRenderer } from "./preview/PreviewRenderer.js";

/**
 * Initialize addon on first system run
 */
function initializeAddon() {
  try {
    const logPrefix = "§6[WorldEdit]§r ";
    console.info(logPrefix + "Addon loaded successfully!");
    console.info(logPrefix + `Version: 1.4.0 | Max blocks: ${CONFIG.MAX_BLOCK_LIMIT}`);
    console.info(logPrefix + `Type /whelp for command list`);

    // Warm the block registry cache once at startup, so the very first
    // /set, /replace, /wsuggest etc. don't pay the BlockTypes.getAll()
    // cost mid-command. See blocks/BlockRegistry.js.
    blockRegistry.load();
    previewRenderer.clearAllTagged();
    previewRenderer.start(selectionManager);
  } catch (error) {
    console.error("Error initializing addon:", error);
  }
}

/**
 * Registro dos comandos reais usando a Custom Command API do Bedrock.
 *
 * IMPORTANTE (motivo do bug "Comando desconhecido: wand"):
 * No Bedrock, qualquer mensagem de chat que comece com "/" é interceptada
 * pelo PRÓPRIO CLIENTE do jogo, que tenta resolvê-la como um comando real
 * antes de qualquer coisa. Se o comando não existir de verdade (registrado
 * via API), o cliente mostra "Comando desconhecido" e a mensagem NUNCA
 * chega ao evento `chatSend` do script. Ou seja: a versão anterior deste
 * addon, que tentava interpretar "/wand", "/set" etc. dentro de
 * `world.beforeEvents.chatSend`, nunca poderia funcionar - não é uma questão
 * de bug pontual, é uma limitação da engine.
 *
 * A forma correta é registrar cada comando de verdade através do
 * `customCommandRegistry`, disponível a partir do @minecraft/server 2.1.0+.
 * Isso também exige que os comandos tenham um namespace (ex: "we:set"),
 * mas o próprio Minecraft registra automaticamente a versão sem namespace
 * também (ex: "/set"), então os comandos continuam funcionando exatamente
 * como pedido, começando só com "/".
 *
 * SOBRE AUTOCOMPLETE DE BLOCOS (decisão de arquitetura):
 * A Custom Command API tem `CustomCommandParamType.BlockType`, que dá
 * autocomplete NATIVO de verdade (mesma UI do /give). O problema é que
 * esse tipo só aceita IDs reais ("minecraft:diamond_block") - ele não
 * passa pelo nosso resolvedor de aliases, então digitar "diamond" ou
 * "log" pararia de funcionar. Como suportar aliases era requisito,
 * os argumentos de bloco continuam como String, e a "experiência de
 * autocomplete" é entregue de duas formas: (1) o comando /wsuggest,
 * que devolve sugestões instantâneas para qualquer trecho digitado, e
 * (2) mensagens "você quis dizer" (fuzzy search) sempre que um bloco
 * não resolver em /set, /replace, /walls, /faces, /outline. Ver
 * blocks/BlockAutocomplete.js e commands/WSuggestCommand.js.
 */
system.beforeEvents.startup.subscribe((init) => {
  const registry = init.customCommandRegistry;

  for (const command of commandRegistry.getAll()) {
    registry.registerCommand(
      {
        name: `we:${command.name}`,
        description: (command.description || command.name).slice(0, 100),
        permissionLevel: CommandPermissionLevel.Any,
        cheatsRequired: false,
        // Todos os comandos aceitam até 3 argumentos opcionais em texto.
        // Cada classe de comando (SetCommand, ReplaceCommand, etc.) já valida
        // sozinha quantos argumentos precisa e mostra o uso correto se faltar.
        optionalParameters: [
          { name: "arg1", type: CustomCommandParamType.String },
          { name: "arg2", type: CustomCommandParamType.String },
          { name: "arg3", type: CustomCommandParamType.String }
        ]
      },
      (origin, arg1, arg2, arg3) => {
        // BUG ENCONTRADO: "origin.initiator" fica undefined quando o comando
        // é digitado direto no chat por um jogador (initiator é usado só em
        // casos como diálogo de NPC). Para comando digitado normalmente,
        // quem executa vem em "origin.sourceEntity". Como o código só tinha
        // "origin.initiator" e fazia "if (!player) return;" logo em seguida,
        // TODOS os comandos estavam silenciosamente saindo sem fazer nada -
        // sem erro, sem mensagem, nada. Por isso /wand (e todo o resto)
        // "executava" mas nunca produzia efeito nenhum.
        const player = origin.initiator ?? origin.sourceEntity;
        if (!player) return;

        const args = [arg1, arg2, arg3].filter((a) => a !== undefined);

        // O callback de um Custom Command roda em contexto restrito
        // (early-execution); qualquer coisa que altere o mundo precisa
        // ser adiada com system.run().
        system.run(() => {
          try {
            commandRegistry.execute(command.name, player, args, world);
          } catch (error) {
            console.error(`Erro ao executar /${command.name}:`, error);
            try {
              player.sendMessage("§c[WorldEdit] Ocorreu um erro ao executar o comando.");
            } catch {
              /* jogador pode ter saído */
            }
          }
        });
      }
    );
  }
});

/**
 * Clique esquerdo (quebrar bloco) alterna entre Posição 1 e Posição 2.
 *
 * Agora o clique esquerdo (segurar no mobile ou clique esquerdo no PC)
 * funciona como um toggle: o 1º clique marca a Pos1, o 2º clique marca
 * a Pos2, o 3º marca a Pos1 novamente e assim por diante.
 */
const nextPosTracker = new Map();

world.beforeEvents.playerBreakBlock.subscribe((event) => {
  try {
    const { player, block } = event;

    if (!isHoldingWand(player)) return;
    if (!isCreativeMode(player)) return;

    // impede a quebra real do bloco
    event.cancel = true;

    const pos = Vector3.fromLocation(block.location);
    const playerName = player.name;
    
    // Obter qual a próxima posição a marcar (default = 1)
    let nextPos = nextPosTracker.get(playerName) || 1;

    if (nextPos === 1) {
      selectionManager.setPos1(playerName, pos);
      previewRenderer.updatePlayer(player, selectionManager);
      const msg = getMessage("POS1_SET", { x: pos.x, y: pos.y, z: pos.z });
      player.sendMessage(msg);
      nextPosTracker.set(playerName, 2);
    } else {
      selectionManager.setPos2(playerName, pos);
      previewRenderer.updatePlayer(player, selectionManager);
      const msg = getMessage("POS2_SET", { x: pos.x, y: pos.y, z: pos.z });
      player.sendMessage(msg);
      nextPosTracker.set(playerName, 1);
    }
  } catch (error) {
    console.error("Error in left-click handler:", error);
  }
});

/**
 * Cancela interações padrão de blocos (abrir baú, porta, etc.)
 * quando o jogador está segurando a wand, para não atrapalhar a seleção.
 */
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  try {
    const { player } = event;
    if (!isHoldingWand(player)) return;
    if (!isCreativeMode(player)) return;
    event.cancel = true;
  } catch (error) {
    // Silencia erros — se falhar, o pior que acontece é abrir um baú
  }
});

/**
 * Verifica se o jogador está segurando a wand na mão principal.
 *
 * Corrigido: a versão anterior olhava o último slot do inventário
 * (`container.size - 1`), o que não corresponde necessariamente ao item
 * que o jogador está segurando. O jeito certo é ler o componente
 * "minecraft:equippable" e pegar o slot "Mainhand".
 */
function isHoldingWand(player) {
  try {
    const equippable = player.getComponent("minecraft:equippable");
    const itemStack = equippable?.getEquipment("Mainhand");
    return itemStack?.typeId === CONFIG.WAND_ITEM && itemStack?.nameTag === CONFIG.WAND_NAME_TAG;
  } catch (error) {
    console.warn(`Error checking wand for player ${player.name}:`, error);
    return false;
  }
}

/**
 * Get player's position as Vector3
 * @param {Player} player
 * @returns {Vector3}
 */
function getPlayerPosition(player) {
  try {
    return Vector3.fromLocation(player.location);
  } catch (error) {
    console.error("Error getting player position:", error);
    return new Vector3(0, 0, 0);
  }
}

/**
 * Handle player disconnect - cleanup resources
 */
world.afterEvents.playerLeave.subscribe((event) => {
  try {
    const playerName = event.playerName ?? event.player?.name ?? "desconhecido";
    previewRenderer.clear(playerName);
    console.info(`Player ${playerName} disconnected`);
  } catch (error) {
    console.error("Error in player leave handler:", error);
  }
});

/**
 * Run addon initialization on first system tick
 */
system.run(() => {
  try {
    initializeAddon();
  } catch (error) {
    console.error("Error in addon initialization:", error);
  }
});
