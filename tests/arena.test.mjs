import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,reachable,act,endTurn,valid,sight,attackArea,impactArea} from '../src/arena/engine.ts';
test('movement uses walkable paths and each turn allows one move and one action',()=>{
 const g=createGame();assert.equal(reachable(g).has('3,2'),false);assert.equal(reachable(g).has('5,1'),false);
 assert.equal(act(g,'move',2,1),true);assert.equal(act(g,'move',2,2),false);
 g.heroes[1].x=2;g.heroes[1].y=2;
 assert.equal(act(g,'attack',2,2),true);assert.equal(g.heroes[1].hp,7);assert.equal(act(g,'attack',2,2),false);
 endTurn(g);assert.equal(g.active,1);assert.equal(g.moved,false);assert.equal(g.acted,false);
});
test('center scores once per complete round and is contested by living heroes',()=>{
 const g=createGame();g.heroes[0].x=4;g.heroes[0].y=4;
 for(let i=0;i<3;i++)endTurn(g);assert.equal(g.heroes[0].score,0);endTurn(g);assert.equal(g.heroes[0].score,1);
 g.heroes[1].x=5;g.heroes[1].y=4;for(let i=0;i<4;i++)endTurn(g);assert.equal(g.heroes[0].score,1);assert.equal(g.heroes[1].score,0);
 g.heroes[1].hp=0;g.active=3;endTurn(g);assert.equal(g.heroes[0].score,2);
});
test('kills score and defeated heroes return with full health on their own turn',()=>{
 const g=createGame();g.heroes[1].x=2;g.heroes[1].y=1;g.heroes[1].hp=3;
 act(g,'attack',2,1);assert.equal(g.heroes[0].score,1);assert.equal(g.heroes[1].hp,0);
 endTurn(g);assert.equal(g.heroes[1].hp,10);assert.equal(g.heroes[1].x,8);assert.equal(g.heroes[1].y,1);
});
test('skills observe cooldowns, walls block shots, shields reduce damage',()=>{
 const g=createGame();g.heroes[1].x=2;g.heroes[1].y=1;g.heroes[1].shield=true;
 act(g,'skill0',2,1);assert.equal(g.heroes[1].hp,8);assert.equal(g.heroes[0].cooldown[0],3);
 for(let turn=0;turn<4;turn++)endTurn(g);assert.equal(g.heroes[0].cooldown[0],2);assert.equal(valid(g,'skill0',3,1),false);
 assert.equal(sight({x:3,y:1},{x:3,y:3}),false);
});
test('teleports require a free destination and five points end the game',()=>{
 const g=createGame();g.active=2;assert.equal(act(g,'skill1',6,6),true);assert.equal(g.heroes[2].x,6);assert.equal(g.heroes[2].y,6);
 const w=createGame();w.heroes[0].score=4;w.heroes[1].x=2;w.heroes[1].y=1;w.heroes[1].hp=3;
 act(w,'attack',2,1);assert.equal(w.winner,0);assert.equal(valid(w,'move',1,2),false);endTurn(w);assert.equal(w.active,0);
});

test('attack coverage shows empty cells, respects range and excludes walls and blocked shots',()=>{
 const g=createGame();const melee=attackArea(g,'attack');
 assert.equal(melee.size,4);assert.equal(melee.has('2,1'),true);assert.equal(valid(g,'attack',2,1),false);
 assert.equal(melee.has('2,2'),false);assert.equal(melee.has('1,1'),false);
 g.active=1;g.heroes[1].x=3;g.heroes[1].y=1;
 const ranged=attackArea(g,'attack');assert.equal(ranged.has('3,2'),false);assert.equal(ranged.has('3,3'),false);assert.equal(ranged.has('7,1'),true);assert.equal(ranged.has('8,1'),false);
 g.acted=true;assert.equal(attackArea(g,'attack').size,0);
});
test('impact preview matches splash and shockwave damage footprints',()=>{
 const g=createGame();g.active=2;
 assert.deepEqual([...impactArea(g,'skill0',5,5)].sort(),['4,5','5,4','5,5','5,6','6,5']);
 assert.deepEqual([...impactArea(g,'attack',5,5)],['5,5']);
 assert.equal(impactArea(g,'skill1',5,5).size,0);
 g.active=0;g.heroes[0].x=4;g.heroes[0].y=4;
 const wave=impactArea(g,'skill1',4,4);assert.equal(wave.size,13);assert.equal(wave.has('6,4'),true);assert.equal(wave.has('6,5'),false);
 g.heroes[0].cooldown[1]=2;assert.equal(attackArea(g,'skill1').size,0);
});
test('damage feedback reports actual health lost after defense and lethal hits',()=>{
 const g=createGame();g.heroes[1].x=2;g.heroes[1].y=1;g.heroes[1].shield=true;
 act(g,'attack',2,1);
 assert.ok(g.log.includes('Arqueiro sofreu 1 de dano (defesa ativa). Vida: 9/10 PV.'));
 const lethal=createGame();lethal.heroes[1].x=2;lethal.heroes[1].y=1;lethal.heroes[1].hp=1;
 act(lethal,'attack',2,1);
 assert.ok(lethal.log.includes('Arqueiro sofreu 1 de dano. Vida: 0/10 PV.'));
 assert.ok(lethal.log.some(line=>line.includes('derrotou Arqueiro')));
});
test('area attacks report damage for every affected enemy',()=>{
 const g=createGame();g.heroes[0].x=4;g.heroes[0].y=4;
 g.heroes[1].x=5;g.heroes[1].y=4;g.heroes[2].x=4;g.heroes[2].y=5;
 act(g,'skill1',4,4);
 assert.equal(g.heroes[1].hp,7);assert.equal(g.heroes[2].hp,7);
 assert.equal(g.log.filter(line=>line.includes('sofreu 3 de dano')).length,2);
});
