# Sygil Tech

Página institucional da Sygil Tech e portfólio de projetos. O projeto Lendas de Astera é um RPG tático para navegador, feito com TypeScript, Vite e Canvas, com spritesheets de pixel art.

## Jogar

[Site da Sygil Tech](https://levymtmr.github.io/Sygil-Tech/) · [Jogar Lendas de Astera](https://levymtmr.github.io/Sygil-Tech/projetos/astera/)


1. Instale uma versão recente do Node.js.
2. No diretório do projeto, instale as dependências com `npm install`.
3. Inicie o servidor com `npm run dev` e abra o endereço local mostrado no terminal.
4. Para verificar a compilação de produção, execute `npm run build`.

## Controles

- **Exploração:** setas ou WASD, botões direcionais na tela ou toque/clique numa casa vizinha.
- **Encontros:** aproxime-se de uma criatura e use **Enfrentar criatura**.
- **Batalha:** o menu de ações flutua sobre Kael durante o turno dele. Ao escolher uma ação, o menu se recolhe; toque no tile do personagem para reabri-lo. Clique/toque em casas para mover ou escolher um alvo no alcance; cada classe tem animações próprias de ataque.
- **Mapa:** a miniatura no canto do mapa abre a cartografia; pressione **M** para abrir/fechar. As áreas exploradas são reveladas gradualmente; áreas desconhecidas permanecem sob névoa.
- **HUD:** pressione **I** para mochila, **Q** para equipamentos e ficha do personagem, **L** para o registro de eventos; **Escape** fecha o painel aberto. Também é possível abrir os painéis pelo dock discreto na tela.
- **Início e classes:** ao abrir o jogo, escolha Cavaleiro, Arqueiro ou Mago no menu inicial; o botão **Iniciar jornada** só é liberado após uma escolha explícita. Cada caminho tem atributos, equipamento inicial, aparência e habilidades diferentes. Durante a partida, o botão **Classe** permite trocar antes da primeira vitória.
- **Árvore de habilidades:** suba de nível para receber pontos e desbloquear habilidades na ficha de equipamentos (**Q**). No combate, selecione a habilidade no menu sobre o personagem; habilidades de cura/defesa são usadas clicando no tile do personagem.
- **Equipamentos e mochila:** a mochila é uma grade de slots; arraste itens para reorganizar ou toque em dois espaços para movê-los. Equipe ou remova arma, armadura e amuleto. Os bônus de ataque, defesa e vitalidade máxima afetam o combate; poções podem ser usadas na mochila.
- **Bestiário:** abra pelo botão no topo. Monstros avistados ou enfrentados revelam seus atributos base e chances de saque.
- **Recompensas:** ao vencer, o resumo mostra experiência, moedas, subida de nível e itens encontrados; os itens são adicionados à mochila.
- **Celular:** controles na tela e botões grandes; a orientação paisagem oferece mais espaço para o tabuleiro.

## O protótipo inclui

Exploração em grade com regiões, criaturas visíveis e encontros próximos; deslocamentos suaves, passada animada, cortes, projéteis arcanos, impactos e dano flutuante no combate tático; inimigos que avançam e atacam; HUD minimalista com painéis sob demanda para inventário/equipamentos e registro de eventos, bestiário, recompensas, experiência, níveis, poções e escalada de dificuldade. Não há diário de viagem. O progresso deste protótipo existe apenas enquanto a página permanece aberta; recarregar reinicia a jornada.

## Organização do código

O `src/main.ts` carrega os estilos e inicia a aplicação. As responsabilidades ficam distribuídas em:

- `src/app/`: inicialização e registro dos eventos de movimento, painéis, inventário e loja.
- `src/features/`: funcionalidades do jogo, separadas em `combat`, `world`, `character`, `inventory`, `base` e `store`.
- `src/rendering/`: desenho do tabuleiro, personagens, efeitos e animações do canvas.
- `src/ui/`: estrutura HTML, acesso aos elementos, ícones e atualização dos painéis.
- `src/data/`: catálogos de classes, itens, monstros, regiões e móveis. Edite os dados nesses módulos; `catalogs.ts` mantém os exports de compatibilidade.
- `src/game/`: estado compartilhado tipado e regras independentes da interface.
- `src/types.ts` e `src/types/`: contratos e tipos do jogo.
- `src/styles/`: estilos divididos por tela e componente. `style.css` e `ux.css` definem a ordem de carregamento para preservar a cascata.

Para adicionar uma funcionalidade, coloque sua lógica no domínio correspondente em `features/`, seus dados em `data/` e seus eventos em `app/`. Mantenha o desenho do canvas em `rendering/` e as regras de cálculo em `game/`.

Validação: `npm run build` verifica os tipos e gera a versão de produção. Para a verificação manual, use `npm run dev` e confira seleção de classe, exploração, combate, inventário, base, loja e oficina.

## Publicação no GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` roda em todo push e nos pull requests para `main`. Ele instala as dependências com `npm ci`, executa `npm test` e verifica os tipos e o build com `npm run build`. Quando o push é na branch `main`, publica automaticamente `dist/` no GitHub Pages. Outras branches e pull requests fazem somente a validação. Também é possível publicar a `main` manualmente pela aba **Actions**.

No repositório do GitHub, selecione **Settings → Pages → Source → GitHub Actions** antes da primeira publicação. A URL definitiva aparece no ambiente `github-pages` após a execução do workflow.

O Vite gera caminhos relativos para que os arquivos do jogo carreguem dentro do endereço do repositório. Apenas o build estático é publicado; não é necessário manter um servidor local ligado.

O progresso continua apenas na memória da página: trocar de dispositivo ou recarregar inicia uma nova jornada.

## Loja e oficina

Os interiores usam as mesmas spritesheets de pixel art do mapa: balcões, prateleiras, bancadas, plantas, tapetes, lamparinas, produtos e personagens. Os recortes do atlas ficam em `src/data/spriteAtlas.ts` e são compartilhados entre Canvas e interface HTML. As telas e a decoração mantêm seleção por toque e suporte a arrastar produtos e móveis.

## Site da empresa e projetos

A raiz (`index.html`) apresenta a Sygil Tech, seus serviços e projetos. O código institucional fica em `src/company/`, e os textos e contatos ficam em `src/company/content.ts`. O jogo mantém sua entrada em `src/main.ts` e passa a ser acessado por `projetos/astera/index.html`. O Vite gera as duas páginas no mesmo build, sem carregar os recursos do jogo na página institucional.
