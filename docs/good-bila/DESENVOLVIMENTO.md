# Good Bila · desenvolvimento

**Versão documentada:** 0.21.0 · **Estado:** piloto jogável · **Atualização:** 9 de novembro de 2026.

[Apresentação e como jogar](README.md) · [Apoio e parcerias](APOIE.md) · [Código e instruções técnicas](../../projetos/bila-mobile/README.md)

## Implementado

| Área | Estado atual |
|---|---|
| Modo de jogo | Destruction, sem triângulo, com metas cumulativas e progressão de níveis. |
| Cartas | Coleção de 11 cartas; três sorteadas por nível, sem deck builder. |
| Física | Dois impactos para destruir, colisões em cadeia e nove efeitos. |
| Campo | Chuva inicial de 32–56 bilas, distribuição aleatória e obstáculos variados. |
| Interface | Mão recolhível, gauge de força, ícones, cores e animações por estado. |
| Partida | Pontuação, missões, multiplicador, tentativas limitadas e game over com resumo. |
| Plataforma | APK de teste Android ARM32/ARM64 e execução no Godot no computador. |
| Dados e áudio | Apelido, opções e recorde locais; música original e volume independente. |

## Validação atual

A versão 0.21.0 passou por **192 verificações automatizadas na suíte atual**, além da validação de toque em uma janela 432 × 960. A suíte cobre sorteio das cartas, migração do perfil, chuva, física dos efeitos, terreno, pontuação e reinício. Uma amostra de 500 mãos confirmou a presença das 11 cartas e ausência de repetição dentro da mesma mão.

Os prints da apresentação são do piloto executado no Godot. Isso não substitui uma campanha de testes em uma variedade de aparelhos físicos. Versões anteriores já foram testadas no Android pelo autor; compatibilidade ampla ainda é uma prioridade.

## Próximas prioridades

- [ ] Coletar feedback de jogadores e registrar padrões de dificuldade e compreensão.
- [ ] Ajustar progressão, combinações e custo de trocar de carta.
- [ ] Ampliar testes em aparelhos Android com diferentes resoluções e desempenho.
- [ ] Refinar feedback visual, áudio e opções de acessibilidade.
- [ ] Preparar critérios de qualidade para uma versão de distribuição mais ampla.

A ordem pode mudar conforme os testes. Não há data de lançamento comercial anunciada.

## Limites do piloto

O progresso da tentativa fica na partida atual; não há campanha persistente ou salvamento de uma tentativa em andamento. Não há multiplayer, conta online, loja, anúncios ou pagamentos integrados. O instalador é uma compilação de teste, e o jogo não está publicado na Play Store.

A previsão da mira considera o movimento e o terreno, mas não simula toda a cadeia de colisões, atração, explosões e rebotes futuros. Os efeitos e o balanceamento continuam sujeitos a ajustes.

## Acompanhar ou participar

Use os formulários de [feedback](https://github.com/levymtmr/Sygil-Tech/issues/new?template=good-bila-feedback.yml) e [apoio / parceria](https://github.com/levymtmr/Sygil-Tech/issues/new?template=good-bila-apoio.yml). Novas versões públicas ficam nas [Releases do repositório](https://github.com/levymtmr/Sygil-Tech/releases).
