# Good Bila · código do piloto 0.21.0

Jogo 2D de bilas, física e cartas para Android, escrito em GDScript para **Godot 4.4.1**. O modo atual é Destruction: o primeiro impacto racha uma bila, o segundo destrói e pontua.

[**Apresentação, prints e como jogar**](../../docs/good-bila/README.md) · [**Apoiar / investir**](../../docs/good-bila/APOIE.md) · [**Desenvolvimento**](../../docs/good-bila/DESENVOLVIMENTO.md) · [**Histórico**](CHANGELOG.md)

## Executar no computador

Abra `project.godot` no Godot 4.4.1 e pressione F5. Godot 3 não é compatível. A edição .NET também executa os scripts GDScript.

No Linux/macOS, com Godot 4 no PATH:

```bash
cd projetos/bila-mobile
bash jogar.sh
```

Para informar o executável explicitamente:

```bash
GODOT_BIN=/caminho/para/godot4 bash jogar.sh
GODOT_BIN=/caminho/para/godot4 bash tools/testar.sh
```

A resolução lógica base é 720 × 1280, com expansão para telas mais altas e respeito às margens seguras do Android. No computador, use o mouse para pressionar a bila, puxar para trás e soltar. As cartas aceitam arraste para cima ou toque.

## Exportar APK de teste

O exportador atual usa engine e template Android **4.4.1**, JDK 17 e Android SDK 34. No Linux x86_64:

```bash
cd projetos/bila-mobile
python3 tools/setup_android.py
bash tools/export_apk.sh
```

A preparação baixa ferramentas oficiais para `.tools/`, sem alterar o Godot instalado no sistema. O APK sai em `build/bila-piloto.apk`. Para instalar em um aparelho conectado com depuração USB habilitada:

```bash
bash tools/instalar_celular.sh
```

As ferramentas e a chave de desenvolvimento são locais e não devem ser versionadas. Compilações geradas com chaves de teste diferentes não se atualizam uma sobre a outra: pode ser necessário remover uma instalação anterior. Essa é uma distribuição piloto, não uma publicação de loja.

## Verificar

```bash
bash tools/testar.sh
```

A suíte atual cobre coleção aleatória, física, chuva, terreno, efeitos, pontuação e toque nativo. Usa dados de teste próprios. Os arquivos de testes históricos do clássico não fazem parte da suíte atual.

## Estrutura

| Caminho | Função |
|---|---|
| `scripts/game.gd` | Partida, cartas, física dos efeitos, pontos, terreno e áudio. |
| `scripts/marble.gd` | Corpo físico, salto, dano e animações das bilas. |
| `scripts/presentation.gd` | Arena, HUD, trajetória e gauge. |
| `scripts/front_end.gd` | Menu, coleção, detalhes, registro e opções. |
| `scripts/hand_card.gd` | Cartas, versos e gesto de puxar. |
| `scripts/effect_icons.gd` | Ícones e paleta compartilhada dos efeitos. |
| `scripts/game_over.gd` | Apresentação e contagem animada do game over. |
| `tests/` | Suíte atual e testes históricos. |
| `tools/` | Preparação local, teste e exportação Android. |

## Recursos e licenças de terceiros

A Pixelify Sans é acompanhada por `assets/PIXELIFY-LICENSE.txt`. A música original e sua atribuição estão em `assets/MUSIC-LICENSE.txt`. O atlas das bilas faz parte dos recursos do projeto. As condições de publicação comercial e colaboração podem ser discutidas com o autor pelos contatos da [página de apoio](../../docs/good-bila/APOIE.md).

## Publicação

A apresentação fica em `docs/good-bila/`. O workflow `good-bila-release.yml` prepara as ferramentas, executa a suíte, exporta o piloto e publica o APK em uma Release marcada como prévia. Segredos, cache, chaves, dados locais e builds anteriores ficam fora do Git.
