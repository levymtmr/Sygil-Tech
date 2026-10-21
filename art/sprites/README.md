# Spritesheets — Astera v1

Classes ativas: Cavaleiro, Arqueiro e Mago. Duelista e Curandeiro foram removidos do jogo; as artes originais e os prompts abaixo permanecem como histórico. As folhas de movimento dessas duas classes não são carregadas nem incluídas no build.

Geradas com a ferramenta integrada de imagens, usando `art/concepts/shop-concept-v1.png` como referência de estilo. Os PNGs originais com canal alpha estão em `src/assets/sprites/` e são incluídos pelo Vite no build.

## Personagens (`characters-v1.png`)

887 × 1774 px; quatro colunas e oito linhas. Linhas: cavaleiro, arcanista, arqueiro, curandeiro, duelista, limo, lobo e fagulha. Cada linha contém quatro poses. As classes caminham voltadas para a câmera; esta versão ainda não contém direções laterais/costas nem ataques exclusivos em sprites.

Prompt: criar atlas transparente de pixel art refinada para RPG, no estilo aconchegante da loja de referência, câmera superior em três quartos, contornos escuros, detalhes terrosos e luz quente; quatro poses de caminhada por classe (cavaleiro azul de armadura e espada, arcanista roxo de cajado, arqueiro verde com arco, curandeiro marfim/dourado com maça, duelista vermelho com florete), quatro poses de salto para limo verde, caminhada de lobo cinza e chama oscilante para fagulha roxa; sem textos, divisórias ou cenário.

## Cenário (`environment-v1.png`)

1536 × 1024 px; quatro colunas e quatro linhas. Linhas:

1. Carvalho, pinheiro, rocha com musgo, arbusto florido.
2. Loja, prateleira, balcão, bancada de ofício.
3. Planta, tapete, lamparina, barril.
4. Gel verde, pelo de lobo, cristal, poção.

Prompt: criar atlas transparente com dezesseis objetos isolados em pixel art detalhada, seguindo madeira rústica, musgo, plantas e iluminação âmbar da loja de referência; câmera superior em três quartos, quatro colunas por quatro linhas, escala coerente e espaço entre objetos, sem texto nem cenário composto. Objetos conforme a lista acima.

## Integração

`src/rendering/sprites.ts` contém os recortes, nomes e carregamento. As linhas usam limites explícitos em pixels porque a distribuição gerada não é perfeitamente uniforme; não presumir células quadradas. O código mantém a arte anterior como alternativa em caso de erro ao carregar os PNGs.

Animações usam quatro quadros; personagens parados usam o primeiro. Limos e fagulhas têm animação ambiente. O redesenho ambiente pausa com a aba oculta e respeita a preferência de movimento reduzido.

Aparência de equipamento nesta versão é a da classe representada na spritesheet; os bônus dos itens equipados continuam funcionando. Prateleira, balcão, móveis e demais adereços estão disponíveis na folha de cenário para a próxima etapa de arte do interior; o interior da loja ainda usa sua renderização atual.

As artes são incluídas no build publicado pelo workflow do GitHub Pages.

## Movimento em quatro direções

As cinco folhas `src/assets/sprites/movement/*-walk-v1.png` substituem a caminhada frontal das classes. Cada arquivo tem quatro colunas e quatro linhas: frente, esquerda, direita e costas. O primeiro quadro é a pose parada; os demais compõem a passada. Os prompts completos estão em `movement-prompts.md`.

`src/rendering/playerSprites.ts` carrega apenas a classe usada e mede o canal alpha dos dezesseis quadros uma vez, mantendo escala e apoio dos pés consistentes. `src/game/playerMovement.ts` calcula direção e quadro pela duração do deslocamento. Exploração e combate guardam direções independentes. A preferência de movimento reduzido mantém a pose estática durante o deslocamento.

Verificação da lógica: `node --test tests/playerMovement.test.mjs` com Node.js 24. As animações das classes ativas são incluídas na publicação do GitHub Pages.
