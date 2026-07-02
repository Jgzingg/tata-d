# Textura Customizada da Wand

## Estrutura de Arquivos

```
resource_pack/
├── textures/
│   ├── items/
│   │   └── wand.png                    (Textura customizada da wand)
│   └── item_texture.json               (Mapeamento de texturas)
├── models/
│   └── item/
│       └── wand.json                   (Modelo do item)
├── items.json                          (Configuração de itens)
└── manifest.json                       (Metadados do resource pack)
```

## Como Funciona

### 1. **Arquivo de Textura** (`textures/items/wand.png`)
- Imagem PNG 16×16 ou 32×32 pixels
- Define a aparência visual do item
- Suporta transparência (canal alpha)

### 2. **Mapeamento de Texturas** (`textures/item_texture.json`)
```json
{
  "textures": {
    "items/wand": "textures/items/wand"
  }
}
```
- Define qual arquivo PNG é usado como textura
- Permite reutilizar a mesma textura em múltiplos itens

### 3. **Configuração de Itens** (`items.json`)
```json
{
  "items": {
    "minecraft:diamond_axe": {
      "icon": "wand",
      "foil": false
    }
  }
}
```
- Mapeia o item `minecraft:diamond_axe` para usar a textura `wand`
- `foil: false` remove o efeito brilhante de encantamento (opcional)

## Requisitos Mínimos

- **Minecraft Bedrock Edition**: 1.19.50 ou superior
- **Formato PNG**: Suportado (recomendado 16×16)
- **Transparência**: Suportada (canal alpha)

## Instalação

1. Coloque o arquivo `wand.png` em `resource_pack/textures/items/`
2. Os arquivos JSON já estão configurados
3. Ative o resource pack no jogo:
   - Configurações → Comportamento de Packs
   - Mude WorldEdit Addon Resource Pack para "Ativado"

## Visualização da Wand

Quando um jogador recebe a wand com o comando `/wand`, o item exibe:
- **Textura**: wand.png (sua imagem customizada)
- **Nome**: §6WorldEdit Wand (em ouro)
- **Tipo**: Diamond Axe (comportamento)

## Dicas

- Para editar a textura, coloque uma nova versão em `textures/items/wand.png`
- As mudanças aparecem após recarregar o resource pack
- Se a textura não aparecer, verifique:
  - Arquivo PNG existe em `textures/items/wand.png`
  - Pack está ativado nas configurações
  - Nome do arquivo está correto (case-sensitive no Linux)

## Customizações Avançadas

### Alterar Cor ou Efeito Visual
Edite o arquivo PNG com um editor de imagem (Photoshop, GIMP, Paint.NET, etc.)

### Remover Efeito Brilhante
Já está desativado em `items.json` com `"foil": false`

### Usar Item Diferente como Base
Se quiser usar outro item como base em vez de diamond_axe, edite:
1. `config.js`: altere `WAND_ITEM` para o novo item
2. `items.json`: altere a chave `"minecraft:diamond_axe"` para o novo item

---

**Versão**: 1.0.0  
**Última atualização**: 2026-07-02
