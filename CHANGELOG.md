# Registo de Alterações

Todas as alterações relevantes deste projeto são documentadas neste ficheiro.
Cada entrada indica a **data** e a **versão** correspondente, e descreve as
alterações no formato de mensagens de commit de git.

## [0.5.2] — 2026-07-06

fix(game): aproximar o cenário do exemplo (proporções e ligação chão/parede)

- Ajustar as proporções do cenário ao exemplo de referência: descer o plano do
  chão (`groundY` 420 → 466), tornar o teto mais alto e o chão uma faixa fina,
  ficando a parede a dominar o enquadramento.
- Cortar a base do próprio desenho de parede (que trazia chão e sombra de junção
  embutidos) via `tileBand(..., cropBottomFrac)`, eliminando a faixa escura onde
  a personagem pisava — parede e chão passam a ler como uma superfície contínua.
- Verificado nos 7 níveis (arquitetura, artes, desporto, direito, engenharia,
  letras, medicina).
- Adicionar `?v=` (versão) ao `<script src="game.js">` em index.html para
  forçar o refresh da cache do browser a cada build.

## [0.5.1] — 2026-07-02

fix(game): ligar chão às paredes e melhorar a distribuição de decoração

- Puxar o chão ~22px para encaixar no rodapé da parede e substituir a faixa
  escura de contacto por uma sombra ténue, para o chão e a parede lerem como
  uma superfície contínua.
- Espaçar portas, adereços e NPCs num único calendário para não se sobreporem.
- Decorar os níveis com uma maior variedade de NPCs, a partir de um pool com
  todos os de `assets/npc/` (deixam de estar presos ao tema do nível).

## [0.5.0] — 2026-07-02

feat(game): ligar personagem, cenário, rewards, inimigos e NPCs ao jogo

- Usar a **personagem escolhida** como jogador, com animações próprias de cada
  pasta em `assets/personagens/` (idle/step1/step2/jump/crawl, versões normais).
- Construir o cenário a partir do **nível escolhido**: teto/parede/chão de
  `assets/cenarios/<nível>/` (tiras tiladas) com portas, janelas, quadros e
  adereços do próprio cenário espalhados pelo corredor (`drawScene()`,
  `getScene()` com carregamento lazy por nível).
- Decorar o cenário com **NPCs** temáticos de `assets/npc/`.
- Passar as **skills** a usar as imagens de `assets/rewards/`.
- Passar os **inimigos** (distrações) a usar os sprites de `assets/enemies/`.

## [0.4.2] — 2026-07-02

fix(level-select): aumentar a maqueta e mudar o fundo dos cartões

- Aumentar o tamanho da maqueta-arquitectura no cartão de Arquitetura.
- Substituir o fundo preto dos cartões de nível por um gradiente (claro no topo
  a escurecer em baixo) tingido com a cor de cada nível — `drawLevelCardPanel()`.

## [0.4.1] — 2026-07-02

fix(level-select): afinar os adereços de cada nível

- Arquitetura: passar a usar mesa, maqueta, diagrama e quadro.
- Desporto: substituir o banco pelo cacifo (cafico-desporto).
- Engenharia: colocar o braço robótico em primeiro plano.
- Letras: substituir a planta pelo busto (busto-sociais).
- Medicina: colocar a maca em primeiro plano e um pouco maior; substituir o
  extintor pelo quadro-2-medicina.
- Suportar adereços em primeiro plano (`front`) e com escala (`scale`) no
  `drawPropsVignette`, com posições de slot estáveis durante o carregamento.

## [0.4.0] — 2026-07-02

feat(level-select): adicionar ecrã de seleção de nível (screen 3)

- Adicionar novo ecrã `levelSelect` com 7 níveis, cada um representado apenas
  pelos adereços do seu cenário (de `assets/cenarios/<nível>/`), excluindo peças
  estruturais (parede/chão/tecto). Sem texto a nomear cada nível.
- Mostrar os níveis em cartões (grelha 4+3) sobre o fundo da intro, com a
  seleção destacada a dourado e botão "COMEÇAR".
- Escolher com as setas, por toque/clique num cartão, e começar com Enter ou no
  botão.
- Religar o fluxo: personagem → seleção de nível → jogo. O antigo `facultySelect`
  sai do fluxo (código mantido).
- Passar o toast de início e o rótulo do HUD a usar o nível escolhido
  (`levelData`) em vez da faculdade antiga.

## [0.3.0] — 2026-07-02

feat(character-select): adicionar ecrã de seleção de personagem (screen 2)

- Adicionar novo ecrã `characterSelect` com 5 personagens jogáveis, uma de cada
  pasta em `assets/personagens/` (sprites idle, versões normais — não "super").
- Mostrar as personagens em cartões sobre o fundo da intro, com destaque
  dourado na selecionada (com leve animação de flutuação) e botão "CONTINUAR".
- Permitir escolher com as setas ◀ ▶, por toque/clique num cartão, e avançar
  com Enter ou no botão.
- Religar o fluxo: intro → seleção de personagem → seleção de faculdade → jogo.
  O antigo ecrã de título "MISSÃO..." e o antigo `avatarSelect` saem do fluxo
  (código mantido; a personagem por defeito continua a ser usada no jogo).
- Nota: a personagem escolhida ainda não está ligada às animações de jogo.

## [0.2.3] — 2026-07-02

feat(intro): animar botão de início e afinar caixa e label

- Adicionar animação de zoom in/out em loop ao botão "COMEÇAR QUEST!" (oscila
  apenas a partir de 1.0, para a label nunca ficar abaixo do tamanho base).
- Aumentar o tamanho da label do botão e descê-la ligeiramente.
- Aumentar a margem superior do texto dentro da caixa "BEM-VINDO!".
- Reduzir a altura da caixa a partir de baixo (topo mantém-se).

## [0.2.2] — 2026-07-02

fix(intro): compactar caixa e afinar botão de início

- Reduzir ainda mais a altura da caixa "BEM-VINDO!".
- Passar o texto do botão para maiúsculas ("COMEÇAR QUEST!").
- Mover a seta do botão para o lado direito.

## [0.2.1] — 2026-07-02

fix(intro): afinar caixa de boas-vindas e restilizar botão de início

- Reduzir a altura da caixa "BEM-VINDO!" e baixá-la para deixar de sobrepor o
  título "U.PORTO QUEST".
- Restilizar o botão "Começar quest!" com um visual dourado, contorno escuro,
  bisel interior e ícone de "play", tornando-o claramente distinto da caixa de
  texto.

## [0.2.0] — 2026-07-02

feat(intro): restilizar título e adicionar caixa de boas-vindas

- Substituir o título "U.Porto Quest" por um estilo em bloco a duas cores
  ("U.PORTO" em creme, "QUEST" em dourado), com contorno preto e sombra 3D
  extrudida (`drawIntroTitle()` / `drawBlockText()`). O texto mantém-se; só o
  estilo mudou.
- Adicionar caixa de boas-vindas "BEM-VINDO!" por baixo do título, com texto
  descritivo e um pequeno ícone de barrete de finalista (`drawWelcomeBox()`,
  `getWelcomeBoxRect()`, `wrapText()`, `drawGraduationCap()`).
- Remover a camada escura semi-transparente que cobria a intro, deixando o
  fundo mais nítido.
- Reposicionar o botão de início e a fila de NPCs para acomodar a nova caixa.
- Adicionar a constante `GAME_VERSION` e a etiqueta de versão no canto da intro.

## [0.1.0] — 2026-07-02

feat(intro): adicionar ecrã de introdução "U.Porto Quest"

- Adicionar novo ecrã inicial `intro` como primeiro ecrã do jogo, apresentado
  antes do ecrã de título existente.
- Usar `assets/intro/introbackground.png` como fundo, esticado para preencher
  a tela, com uma camada escura para legibilidade do texto.
- Desenhar o título "U.Porto Quest" no topo, no estilo neon do jogo.
- Adicionar uma fila decorativa de personagens NPC (`assets/npc/`) ao fundo do
  ecrã, cada uma a aparecer com efeito de fade-in sequencial.
- Adicionar botão de início "Começar quest!" que avança para o ecrã de título
  (via clique, toque ou tecla Enter).
- Introduzir `goToTitle()` e as funções de desenho `drawIntro()`,
  `drawIntroNpcs()`, `drawIntroButton()` e o auxiliar `clamp01()`.
