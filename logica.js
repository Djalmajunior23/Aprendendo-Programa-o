/* ==========================================
   LÓGICA PRINCIPAL — js/app.js
   ========================================== */

'use strict';

const TOTAL = 7;
let xpTotal  = 0;
const doneMods  = new Set();
const doneChallenges = new Set();

/* ── Textos originais ───────────────────── */
const ORIG = {
  'e0-0': `ALGORITMO "MeuPrimeiro"\nVAR\n   nome  : CARACTERE\n   idade : INTEIRO\n\nINÍCIO\n   nome  <- "Maria"\n   idade <- 16\n\n   ESCREVA("Olá, ", nome)\n   ESCREVA("Você tem ", idade, " anos.")\n   ESCREVA("Bem-vinda ao mundo da programação!")\nFIM`,
  'e1-0': `ALGORITMO "Variaveis"\nVAR\n   nome    : CARACTERE\n   idade   : INTEIRO\n   altura  : REAL\n   ativo   : LÓGICO\n\nINÍCIO\n   nome   <- "Carlos"\n   idade  <- 17\n   altura <- 1.75\n   ativo  <- VERDADEIRO\n\n   ESCREVA("Nome: ", nome)\n   ESCREVA("Idade: ", idade)\n   ESCREVA("Altura: ", altura, " m")\n   ESCREVA("Ativo: ", ativo)\nFIM`,
  'e2-0': `ALGORITMO "EntradaSaida"\nVAR\n   nome  : CARACTERE\n   idade : INTEIRO\n   media : REAL\n\nINÍCIO\n   ESCREVA("Digite seu nome: ")\n   LEIA(nome : "Ana")\n\n   ESCREVA("Digite sua idade: ")\n   LEIA(idade : 15)\n\n   ESCREVA("Digite sua média: ")\n   LEIA(media : 8.5)\n\n   ESCREVA("--- Dados recebidos ---")\n   ESCREVA("Nome: ", nome)\n   ESCREVA("Idade: ", idade, " anos")\n   ESCREVA("Média: ", media)\nFIM`,
  'e3-0': `ALGORITMO "Notas"\nVAR\n   nota : REAL\n\nINÍCIO\n   LEIA(nota : 6.5)\n\n   SE nota >= 7 ENTÃO\n      ESCREVA("Aprovado(a)! Nota: ", nota)\n   SENÃO SE nota >= 5 ENTÃO\n      ESCREVA("Recuperação. Nota: ", nota)\n   SENÃO\n      ESCREVA("Reprovado(a). Nota: ", nota)\n   FIM_SE\n\n   // Troque o valor em LEIA e execute novamente!\nFIM`,
  'e4-0': `ALGORITMO "Tabuada"\nVAR\n   n : INTEIRO\n   i : INTEIRO\n\nINÍCIO\n   LEIA(n : 7)\n   ESCREVA("--- Tabuada do ", n, " ---")\n\n   PARA i DE 1 ATÉ 10 FAÇA\n      ESCREVA(n, " x ", i, " = ", n * i)\n   FIM_PARA\nFIM`,
  'e4-1': `ALGORITMO "Contador"\nVAR\n   contador : INTEIRO\n   limite   : INTEIRO\n\nINÍCIO\n   LEIA(limite : 5)\n   contador <- 1\n\n   ENQUANTO contador <= limite FAÇA\n      ESCREVA("Contagem: ", contador)\n      contador <- contador + 1\n   FIM_ENQUANTO\n\n   ESCREVA("Fim da contagem!")\nFIM`,
  'e5-0': `ALGORITMO "Vetor"\nVAR\n   notas : VETOR[1..5] DE REAL\n   i     : INTEIRO\n   soma  : REAL\n   media : REAL\n\nINÍCIO\n   notas[1] <- 7.0\n   notas[2] <- 8.5\n   notas[3] <- 6.0\n   notas[4] <- 9.0\n   notas[5] <- 7.5\n\n   soma <- 0\n   PARA i DE 1 ATÉ 5 FAÇA\n      soma <- soma + notas[i]\n   FIM_PARA\n\n   media <- soma / 5\n   ESCREVA("Soma: ", soma)\n   ESCREVA("Média da turma: ", media)\nFIM`,
  'e6-0': `ALGORITMO "Funcoes"\nVAR\n   area1 : REAL\n   area2 : REAL\n\nFUNÇÃO calcularArea(base : REAL, altura : REAL) : REAL\nINÍCIO\n   RETORNE base * altura / 2\nFIM_FUNÇÃO\n\nPROCEDIMENTO exibirResultado(valor : REAL)\nINÍCIO\n   ESCREVA("Área calculada: ", valor)\nFIM_PROCEDIMENTO\n\nINÍCIO\n   area1 <- calcularArea(6.0, 4.0)\n   area2 <- calcularArea(10.0, 3.0)\n\n   exibirResultado(area1)\n   exibirResultado(area2)\n   ESCREVA("Soma das áreas: ", area1 + area2)\nFIM`,
};

const ORIG_CHALLENGES = {
  0: `ALGORITMO "Desafio01"\nVAR\n   mensagem : CARACTERE\n\nINÍCIO\n   mensagem <- "Escreva algo aqui"\n   ESCREVA(mensagem)\n   // adicione mais dois ESCREVA abaixo\n\nFIM`,
  1: `ALGORITMO "Cadastro"\nVAR\n   produto    : CARACTERE\n   preco      : REAL\n   quantidade : INTEIRO\n   disponivel : LÓGICO\n\nINÍCIO\n   // atribua valores e mostre com ESCREVA\n\nFIM`,
  2: `ALGORITMO "Desconto"\nVAR\n   preco      : REAL\n   desconto   : REAL\n   valorDesc  : REAL\n   precoFinal : REAL\n\nINÍCIO\n   LEIA(preco : 100.0)\n   LEIA(desconto : 15.0)\n\n   valorDesc  <- preco * desconto / 100\n   precoFinal <- preco - valorDesc\n\n   ESCREVA("Preço original: ", preco)\n   ESCREVA("Desconto: ", valorDesc)\n   ESCREVA("Preço final: ", precoFinal)\nFIM`,
  3: `ALGORITMO "IMC"\nVAR\n   peso   : REAL\n   altura : REAL\n   imc    : REAL\n\nINÍCIO\n   LEIA(peso : 70.0)\n   LEIA(altura : 1.75)\n\n   imc <- peso / (altura * altura)\n   ESCREVA("IMC calculado: ", imc)\n\n   SE imc < 18.5 ENTÃO\n      ESCREVA("Classificação: Abaixo do peso")\n   SENÃO SE imc < 25 ENTÃO\n      ESCREVA("Classificação: Peso normal")\n   SENÃO SE imc < 30 ENTÃO\n      ESCREVA("Classificação: Sobrepeso")\n   SENÃO\n      ESCREVA("Classificação: Obesidade")\n   FIM_SE\nFIM`,
  4: `ALGORITMO "Pares"\nVAR\n   i : INTEIRO\n\nINÍCIO\n   ESCREVA("Números pares de 1 a 20:")\n\n   PARA i DE 1 ATÉ 20 FAÇA\n      SE i MOD 2 = 0 ENTÃO\n         ESCREVA(i)\n      FIM_SE\n   FIM_PARA\nFIM`,
  5: `ALGORITMO "MaiorValor"\nVAR\n   v     : VETOR[1..5] DE INTEIRO\n   i     : INTEIRO\n   maior : INTEIRO\n\nINÍCIO\n   v[1] <- 12\n   v[2] <- 45\n   v[3] <- 7\n   v[4] <- 30\n   v[5] <- 22\n\n   maior <- v[1]\n\n   PARA i DE 2 ATÉ 5 FAÇA\n      SE v[i] > maior ENTÃO\n         maior <- v[i]\n      FIM_SE\n   FIM_PARA\n\n   ESCREVA("Maior valor encontrado: ", maior)\nFIM`,
  6: `ALGORITMO "FuncaoMedia"\nVAR\n   m : REAL\n\nFUNÇÃO calcularMedia(a : REAL, b : REAL, c : REAL) : REAL\nINÍCIO\n   RETORNE (a + b + c) / 3\nFIM_FUNÇÃO\n\nINÍCIO\n   m <- calcularMedia(7.0, 8.5, 6.0)\n   ESCREVA("Média: ", m)\n\n   SE m >= 7 ENTÃO\n      ESCREVA("Aprovado!")\n   SENÃO\n      ESCREVA("Reprovado.")\n   FIM_SE\nFIM`,
};

/* ── Navegação ────────────────────────────── */
function goTo(idx) {
  document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
  document.querySelectorAll('.mnav').forEach(b => b.classList.remove('active'));
  const mod = document.getElementById('module-' + idx);
  if (mod) { mod.classList.add('active'); }
  const btn = document.getElementById('nav-' + idx);
  if (btn) { btn.classList.add('active'); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Avançar módulo ────────────────────────── */
function advance(idx) {
  if (doneMods.has(idx)) return;
  doneMods.add(idx);
  addXP(50);
  showBadge('🏅 Módulo ' + (idx + 1) + ' concluído! +50 XP');
  updateProgress();
  const nb = document.getElementById('nav-' + idx);
  if (nb) { nb.classList.remove('active'); nb.classList.add('done'); }
  const next = idx + 1;
  if (next < TOTAL) { setTimeout(() => goTo(next), 400); }
  else { showFinish(); }
  saveProgress();
}

/* ── XP e progresso ───────────────────────── */
function addXP(n) {
  xpTotal += n;
  const el = document.getElementById('xp');
  if (el) el.textContent = '⭐ ' + xpTotal + ' XP';
}

function updateProgress() {
  const pct = (doneMods.size / TOTAL) * 100;
  const bar = document.getElementById('prog-inner');
  if (bar) bar.style.width = pct + '%';
}

/* ── Badge popup ──────────────────────────── */
function showBadge(msg) {
  const el = document.getElementById('badge');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
}

/* ── Tela final ───────────────────────────── */
function showFinish() {
  document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
  const fin = document.getElementById('finish');
  if (fin) {
    fin.style.display = 'block';
    const xpEl = document.getElementById('final-xp');
    if (xpEl) xpEl.textContent = '⭐ ' + xpTotal + ' XP conquistados!';
  }
}

function restartCourse() {
  doneMods.clear();
  doneChallenges.clear();
  xpTotal = 0;
  const xpEl = document.getElementById('xp');
  if (xpEl) xpEl.textContent = '⭐ 0 XP';
  updateProgress();
  const fin = document.getElementById('finish');
  if (fin) fin.style.display = 'none';
  document.querySelectorAll('.mnav').forEach(b => b.classList.remove('done', 'active'));
  document.querySelectorAll('.c-result').forEach(r => { r.className = 'c-result'; r.textContent = ''; });
  document.querySelectorAll('.next-btn').forEach(b => b.disabled = true);
  document.querySelectorAll('.output').forEach(o => { o.textContent = ''; o.classList.remove('visible', 'err'); });
  localStorage.removeItem('prog_pseudo_v1');
  goTo(0);
}

/* ── Reset editor ─────────────────────────── */
function resetEditor(editorId) {
  const el = document.getElementById(editorId);
  if (el && ORIG[editorId]) {
    el.value = ORIG[editorId];
    const outId = editorId.replace('e', 'o');
    const out = document.getElementById(outId);
    if (out) { out.textContent = ''; out.classList.remove('visible', 'err'); }
  }
}

function resetChallenge(idx) {
  const ed  = document.getElementById('ce' + idx);
  const out = document.getElementById('co' + idx);
  const res = document.getElementById('cr' + idx);
  if (ed  && ORIG_CHALLENGES[idx] !== undefined) ed.value = ORIG_CHALLENGES[idx];
  if (out) { out.textContent = ''; out.classList.remove('visible', 'err'); }
  if (res) { res.className = 'c-result'; res.textContent = ''; }
}

/* ── Troca de abas de linguagem ─────────────── */
function switchTab(tabsId, blocksId, activeIdx) {
  const CLASSES = ['pseudo', 'csharp', 'java'];
  document.querySelectorAll('#' + tabsId + ' .ltab').forEach((t, i) => {
    t.classList.remove('active', 'pseudo', 'csharp', 'java');
    if (i === activeIdx) { t.classList.add('active', CLASSES[i] || 'pseudo'); }
  });
  document.querySelectorAll('#' + blocksId + ' > .code-block').forEach((b, i) => {
    b.style.display = i === activeIdx ? 'block' : 'none';
  });
}

/* ── Verificação dos desafios ────────────────── */
function checkChallenge(idx) {
  const edEl  = document.getElementById('ce' + idx);
  const outEl = document.getElementById('co' + idx);
  const resEl = document.getElementById('cr' + idx);
  if (!edEl) return;

  const res = interpretPseudo(edEl.value);
  outEl.textContent = res.output || '(nenhuma saída)';
  outEl.classList.toggle('err', res.error);
  outEl.classList.add('visible');

  if (res.error) {
    resEl.textContent = '❌ Corrija o erro acima e tente novamente.';
    resEl.className   = 'c-result bad';
    return;
  }

  const lines   = res.output.split('\n').filter(l => l.trim());
  const codeLow = edEl.value.toLowerCase();
  let passed = false;
  let msg    = '';

  switch (idx) {
    case 0:
      passed = lines.length >= 3;
      msg    = passed ? '🎉 Ótimo! Você exibiu 3 linhas com ESCREVA!' : '⚠️ Exiba pelo menos 3 linhas com ESCREVA.';
      break;
    case 1:
      passed = codeLow.includes('produto') && codeLow.includes('preco') &&
               codeLow.includes('quantidade') && codeLow.includes('disponivel') && lines.length >= 4;
      msg    = passed ? '🎉 Cadastro criado! Todas as variáveis usadas!' : '⚠️ Use as 4 variáveis pedidas e mostre cada uma.';
      break;
    case 2:
      passed = (codeLow.includes('valordesc') || codeLow.includes('valor_desc')) &&
               (codeLow.includes('precofinal') || codeLow.includes('preco_final')) && lines.length >= 3;
      msg    = passed ? '🎉 Calculadora de desconto funcionando!' : '⚠️ Calcule valorDesc e precoFinal e mostre os dois.';
      break;
    case 3:
      passed = lines.length >= 2 && res.output.length > 5;
      msg    = passed ? '🎉 Classificador de IMC correto!' : '⚠️ Complete o SE/SENÃO para todas as faixas.';
      break;
    case 4: {
      const nums = lines.map(l => parseInt(l.replace(/\D/g, ''))).filter(n => !isNaN(n) && n > 0 && n % 2 === 0);
      const exp  = [2,4,6,8,10,12,14,16,18,20];
      passed = exp.every(n => nums.includes(n));
      msg    = passed ? '🎉 Todos os pares de 2 a 20 exibidos!' : '⚠️ Verifique se todos os pares de 2 a 20 aparecem.';
      break;
    }
    case 5:
      passed = res.output.includes('45') && lines.length >= 1;
      msg    = passed ? '🎉 Maior valor (45) encontrado corretamente!' : '⚠️ Compare cada elemento com o maior atual.';
      break;
    case 6:
      passed = (res.output.includes('7.25') || res.output.includes('7,25')) &&
               (res.output.toLowerCase().includes('aprovado') || res.output.toLowerCase().includes('reprovado'));
      msg    = passed ? '🏆 Função com retorno implementada! Parabéns!' : '⚠️ A função deve calcular a média e usar RETORNE.';
      break;
    default:
      passed = lines.length >= 1;
      msg    = passed ? '🎉 Desafio concluído!' : '⚠️ Verifique o código.';
  }

  resEl.textContent = msg;
  resEl.className   = 'c-result ' + (passed ? 'ok' : 'bad');

  if (passed && !doneChallenges.has(idx)) {
    doneChallenges.add(idx);
    addXP(30);
    showBadge('⭐ Desafio ' + (idx + 1) + ' concluído! +30 XP');
    const nb = document.getElementById('next-' + idx);
    if (nb) nb.disabled

