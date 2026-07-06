# Registo de Alterações

Todas as alterações relevantes deste projeto são documentadas neste ficheiro.
Cada entrada indica a **data** e a **versão** correspondente, e descreve as
alterações no formato de mensagens de commit de git.

## [0.9.1] — 2026-07-06

fix(assets): atualizar sprites e corrigir frames do programador

- Atualizar os sprites dos NPCs (`assets/npc/`) e do idle da personagem em
  cadeira de rodas (re-exportados).
- personagem_3 (programador): apontar o walk normal para
  `student-it-man-step1.png` (o `student-man-it-step1.png` foi removido) e
  acrescentar `super-student-man-it-step1.png` ao walk da versão "super".
- Adicionar as imagens de referência de design (`exemplo_jogo.png`,
  `cenario_exemplo.png`).

## [0.9.0] — 2026-07-06

feat(game): painel final ao completar todos os níveis

- Adicionar um ecrã final celebrativo (modo `finale`) quando o jogador completa
  os 7 níveis: título "U.PORTO QUEST" / "MISSÃO COMPLETA!", lista dos níveis com
  vistos verdes, mensagem de parabéns, NPCs a celebrar e confetes.
- Ao vencer o último nível em falta, o ecrã de vitória passa a levar ao painel
  final (em vez do seletor); "jogar de novo" limpa o progresso e volta à seleção
  de personagem (`afterWin()` / `finishFinale()` / `drawFinale()`).

## [0.8.1] — 2026-07-06

fix(mobile): controlos compactos e sem botão inútil

- Redesenhar os controlos de toque: barra compacta com as direções (◀ ▶) à
  esquerda e as ações (▼ agachar / ▲ saltar) à direita, numa só linha — deixam
  de empilhar e de ocupar meio ecrã, e separam movimento de agachar/saltar.
- Remover o botão "Começar" (redundante: os menus avançam tocando na própria
  tela).
- Passar a versionar também o `styles.css` no `<link>` para forçar o refresh da
  cache do browser.

## [0.8.0] — 2026-07-06

feat(game): balões de curiosidades da U.Porto nos NPCs

- Ao passar por um NPC de cenário, aparece um balão de fala com uma curiosidade
  sobre a U.Porto e um link "SABER MAIS ▸" que abre a página oficial num
  separador novo (`drawNpcCuriosities()` / `drawCuriosityBalloon()`). Cursor de
  "mão" ao passar por cima.
- Sortear aleatoriamente, a cada jogada/nível, que NPC e que curiosidade
  aparecem em cada posição (`makeSceneNpcs()` / `state.sceneNpcs`), com ligações
  a https://www.up.pt/acesso/conhece-a-universidade-do-porto/ e
  https://www.up.pt/acesso/sempre-contigo/.
- Afastar os inimigos das zonas dos NPCs para o jogador poder parar e ler os
  balões sem ser atingido.
- Nota: os textos usam factos gerais/públicos da U.Porto (as páginas oficiais
  bloquearam o acesso automático); rever os números se necessário.

## [0.7.1] — 2026-07-06

fix(character-select): fundo dos cartões em gradiente (como no seletor de nível)

- Substituir o fundo preto dos cartões de personagem por um gradiente tingido,
  igual ao dos cartões do seletor de nível. Cada personagem tem uma cor própria.
- Tornar o helper do cartão genérico (`drawLevelCardPanel` → `drawGradientCard`),
  partilhado pelos seletores de nível e de personagem.

## [0.7.0] — 2026-07-06

feat(game): balão do inimigo e pausa a piscar ao ser atingido

- Ao ser atingido por um inimigo (sem perder a última vida), mostrar um balão de
  fala por cima do jogador a dizer que inimigo foi ("APANHADO POR …"), com nomes
  em português por tipo de inimigo (`enemyNames`).
- Congelar a jogabilidade durante uma breve pausa (`state.hitPause`, ~1,6s) em
  que o jogador pisca, antes de se poder voltar a mover. Substitui o antigo toast
  genérico de "DISTRAÇÃO!".

## [0.6.4] — 2026-07-06

polish(win): aproximar o ecrã de fim de nível ao ecrã inicial

- Redesenhar o ecrã de vitória com o visual da intro: fundo do campus, título
  em bloco a duas cores "MISSÃO CUMPRIDA!", e um painel escuro (estilo caixa de
  boas-vindas) com a mensagem, as recompensas recolhidas e o "QUERES JOGAR DE
  NOVO?".
- Usar os NPCs atuais (`assets/npc/`) a celebrar na fila de baixo, em vez dos
  antigos props (`drawWinNpcs()`).

## [0.6.3] — 2026-07-06

fix(scene): aumentar o tamanho dos quadros

- Aumentar a altura de render dos quadros (wall art) de 92 → 130 px, ficando
  mais destacados na parede.

## [0.6.2] — 2026-07-06

fix(scene): descer os quadros e subir as portas

- Descer os quadros (wall art) 20px na vertical (top Y 150 → 170).
- Subir as portas 10px (base em `propBase - 10`), sem afetar os restantes
  adereços de chão.

## [0.6.1] — 2026-07-06

fix(hud): centrar o contador de tempo

- Colocar o contador de tempo no centro da barra do topo (corações à esquerda,
  recompensas à direita). Mover o indicador de god mode para não sobrepor.

## [0.6.0] — 2026-07-06

feat(game): repetir nível após vitória e reorganizar o HUD

- Ao completar um nível, a celebração passa a perguntar "QUERES JOGAR DE NOVO?"
  e o jogador é reencaminhado para o seletor de níveis (em vez de recomeçar o
  mesmo nível).
- Marcar os níveis já jogados no seletor com um crachá verde de "concluído"
  (`completedLevels` + `drawCompletedBadge()`).
- HUD: colocar os corações à esquerda seguidos do tempo, e as recompensas
  (skills recolhidas) à direita. Remover o painel de pontuação "COMP.".

## [0.5.8] — 2026-07-06

fix(hud): juntar vidas, tempo e recompensas na barra preta do topo

- Aumentar a barra preta do topo (48 → 66 px) e passar a desenhar tudo dentro
  dela, numa linha: tempo · vidas (corações) · recompensas recolhidas ·
  pontuação (COMP). As vidas e as recompensas deixam de flutuar por baixo da
  barra, sobre o cenário.

## [0.5.7] — 2026-07-06

fix(hud): remover o título do nível do HUD

- Deixar de mostrar o nome do nível (ARQUITETURA, BELAS ARTES, etc.) no centro
  do topo do HUD durante o jogo. O toast "MISSÃO INICIADA!" mantém-se.

## [0.5.6] — 2026-07-06

feat(intro): virar o 3.º NPC à direita e esvaziar o 4.º lugar

- Trocar o terceiro NPC da intro para `doctor-woman_right.png`.
- Remover o quarto NPC (eng-man) e manter o lugar vazio (`null`), sem
  reorganizar a fila — os restantes mantêm a posição.

## [0.5.5] — 2026-07-06

feat(intro): usar as variantes "_right" dos primeiros NPCs

- Trocar os dois primeiros NPCs da fila da intro pelas variantes viradas à
  direita: `student-woman_right.png` e `architect-man_right.png`.
- O terceiro (doctor-woman) fica na versão normal por ainda não existir uma
  variante `_right` (só há `doctor-woman_left.png`).

## [0.5.4] — 2026-07-06

feat(game): god mode (Konami) troca a personagem para a versão "super"

- Ao ativar o código Konami (god mode), o sprite do jogador passa a usar a
  versão "super" (herói) de cada personagem, de `assets/personagens/` (idle/
  step1/step2/jump/crawl), voltando ao normal quando o god mode é desativado.
- Carregar os frames "super" de cada personagem (`superFrames`) além dos
  normais; `getCharacterFrame` escolhe o conjunto conforme `godMode`.

## [0.5.3] — 2026-07-06

fix(game): plantar a personagem, NPCs, rewards e inimigos um pouco mais abaixo

- Descer o plano do chão (`groundY` 466 → 480) para plantar a personagem, os
  NPCs, as skills e os inimigos um pouco mais abaixo, mais assentes nas
  tijoleiras.
- Manter o topo visual do chão em ~450 (`floorTop = groundY - 30`), para as
  proporções teto/parede/chão não mudarem.
- Ancorar as portas e os adereços de chão um pouco acima do plano do chão
  (`groundY - 20`), junto à linha parede/chão, para não afundarem — os NPCs é
  que ficam à frente, no chão, com a personagem.

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
