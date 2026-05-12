/* ==========================================
   INTERPRETADOR DE PSEUDOLINGUAGEM
   js/pseudo.js
   ========================================== */

'use strict';

/**
 * Ponto de entrada chamado pelo HTML
 */
function runPseudo(editorId, outputId) {
  const code  = document.getElementById(editorId).value;
  const outEl = document.getElementById(outputId);
  const res   = interpretPseudo(code);
  outEl.textContent = res.output || '(nenhuma saída)';
  outEl.classList.toggle('err', res.error);
  outEl.classList.add('visible');
}

/**
 * Interpreta pseudocódigo e retorna { output, error }
 */
function interpretPseudo(source) {
  let output = '';
  let error  = false;
  const vars = {};          // variáveis globais
  const fns  = {};          // funções declaradas

  const lines = source.split('\n');

  /* ── 1. Pré-processamento: LEIA com valor padrão ── */
  const leiaDefaults = {};
  lines.forEach(l => {
    const m = l.trim().match(/
^
LEIA\s*|
$
\s*(\w+)\s*:\s*(.+?)\s*
$
|
$
/i);
    if (m) leiaDefaults[m[1]] = parseValue(m[2], vars);
  });

  /* ── 2. Extrai funções/procedimentos ── */
  const cleanedLines = extractFunctions(lines, fns);

  /* ── 3. Tokeniza linhas executáveis ── */
  const tokens = tokenize(cleanedLines);

  /* ── 4. Executa ── */
  try {
    const err = execute(tokens, vars, fns, leiaDefaults, 0);
    if (err) { output = err; error = true; }
  } catch (e) {
    output = '❌ Erro inesperado: ' + e.message;
    error  = true;
  }

  return { output: output.trimEnd(), error };

  /* ════════════════════════════════════════
     FUNÇÕES INTERNAS
     ════════════════════════════════════════ */

  function extractFunctions(allLines, registry) {
    const result = [];
    let i = 0;
    while (i < allLines.length) {
      const t = allLines[i].trim();
      const fnMatch  = t.match(/
^
FUNÇÃO\s+(\w+)\s*|
$
([^)]*)
$
|\s*:\s*\w+
$
/i);
      const prMatch  = t.match(/
^
PROCEDIMENTO\s+(\w+)\s*|
$
([^)]*)
$
|
$
/i);
      const match    = fnMatch || prMatch;

      if (match) {
        const name    = match[1];
        const params  = match[2].split(',').map(p => p.trim().split(/\s*:\s*/)[0].trim()).filter(Boolean);
        const body    = [];
        let depth = 1; i++;
        while (i < allLines.length && depth > 0) {
          const lt = allLines[i].trim();
          if (/
^
(FUNÇÃO|PROCEDIMENTO)\s+/i.test(lt)) depth++;
          if (/
^
FIM_(FUNÇÃO|PROCEDIMENTO)
$
/i.test(lt)) { depth--; if (!depth) { i++; break; } }
          body.push(allLines[i]);
          i++;
        }
        registry[name.toUpperCase()] = { params, body };
      } else {
        result.push(allLines[i]);
        i++;
      }
    }
    return result;
  }

  function tokenize(rawLines) {
    const skip = /
^
(ALGORITMO|VAR|INÍCIO|FIM|\/\/|
$
)/i;
    const typeDecl = /
^
\w[\wá-úÁ-Ú]*\s*:\s*(INTEIRO|REAL|CARACTERE|LÓGICO|LOGICO|TEXTO|BOOLEAN|VETOR)/i;
    return rawLines
      .map(l => l.trim())
      .filter(l => l && !skip.test(l) && !typeDecl.test(l) && !l.startsWith('//'));
  }

  /* ── Avaliação de expressão ── */
  function evalExpr(expr, ctx) {
    expr = expr.trim();
    if (/
^
".*"
$
/.test(expr))   return expr.slice(1, -1);
    if (/
^
'.*'
$
/.test(expr))   return expr.slice(1, -1);
    if (/
^
VERDADEIRO
$
/i.test(expr)) return true;
    if (/
^
FALSO
$
/i.test(expr))      return false;

    // chamada de função: nome(args)
    const callM = expr.match(/
^
([A-Za-zÀ-ú_]\w*)\s*|
$
(.*)?
$
|
$
/);
    if (callM && fns[callM[1].toUpperCase()]) {
      return callFunction(callM[1], callM[2] || '', ctx);
    }

    // acesso a vetor: v[i]
    const arrM = expr.match(/
^
(\w+)\s*|
$
\s*(.+?)\s*
$
|
$
/);
    if (arrM) {
      const arrName = arrM[1];
      const idx     = Math.round(evalExpr(arrM[2], ctx));
      const arr     = ctx[arrName];
      if (Array.isArray(arr)) return arr[idx - 1] ?? 0;
      return 0;
    }

    // operador MOD
    expr = expr.replace(/
\b
MOD
\b
/gi, '%');

    // substitui variáveis
    const safe = expr.replace(/[A-Za-zÀ-ú_]\w*/g, n => {
      if (n.toUpperCase() in ctx) {
        const v = ctx[n.toUpperCase()];
        return typeof v === 'string' ? JSON.stringify(v) : String(v);
      }
      if (n in ctx) {
        const v = ctx[n];
        return typeof v === 'string' ? JSON.stringify(v) : String(v);
      }
      return n;
    });

    try { return Function('"use strict"; return (' + safe + ')')(); }
    catch(e) { return expr; }
  }

  function parseValue(val, ctx) {
    val = val.trim();
    if (/
^
".*"
$
/.test(val)) return val.slice(1, -1);
    if (/
^
'.*'
$
/.test(val)) return val.slice(1, -1);
    if (/
^
VERDADEIRO
$
/i.test(val)) return true;
    if (/
^
FALSO
$
/i.test(val))      return false;
    if (!isNaN(val) && val !== '') return Number(val);
    return evalExpr(val, ctx);
  }

  function evalCond(cond, ctx) {
    cond = cond.trim()
      .replace(/
\b
E
\b
/g,   '&&')
      .replace(/
\b
OU
\b
/g,  '||')
      .replace(/
\b
NÃO
\b
/g, '!')
      .replace(/
\b
NAO
\b
/g, '!')
      .replace(/
\b
MOD
\b
/gi,'%')
      .replace(/<>/g,      '!=')
      .replace(/(?<![<>!])=(?!=)/g, '===');

    const safe = cond.replace(/[A-Za-zÀ-ú_]\w*/g, n => {
      if (n === 'true' || n === 'false') return n;
      const key = n.toUpperCase();
      if (key in ctx) {
        const v = ctx[key];
        return typeof v === 'string' ? JSON.stringify(v) : String(v);
      }
      if (n in ctx) {
        const v = ctx[n];
        return typeof v === 'string' ? JSON.stringify(v) : String(v);
      }
      return n;
    });

    try { return Function('"use strict"; return (' + safe + ')')(); }
    catch(e) { return false; }
  }

  function joinArgs(argsStr, ctx) {
    return splitArgs(argsStr)
      .map(p => {
        const v = evalExpr(p.trim(), ctx);
        if (typeof v === 'number' && !Number.isInteger(v)) {
          return parseFloat(v.toFixed(4)).toString();
        }
        return String(v);
      })
      .join('');
  }

  function splitArgs(str) {
    const res = []; let cur = ''; let depth = 0;
    let inStr = false; let sc = '';
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (!inStr && (c === '"' || c === "'")) { inStr = true; sc = c; cur += c; continue; }
      if (inStr && c === sc) { inStr = false; cur += c; continue; }
      if (!inStr && c === '(') { depth++; cur += c; continue; }
      if (!inStr && c === ')') { depth--; cur += c; continue; }
      if (!inStr && depth === 0 && c === ',') { res.push(cur); cur = ''; continue; }
      cur += c;
    }
    if (cur.trim()) res.push(cur);
    return res;
  }

  function callFunction(name, argsStr, ctx) {
    const fn   = fns[name.toUpperCase()];
    if (!fn) return undefined;
    const args = splitArgs(argsStr).map(a => evalExpr(a.trim(), ctx));
    const local = Object.assign({}, ctx);
    fn.params.forEach((p, i) => { local[p.toUpperCase()] = local[p] = args[i]; });
    const bodyTokens = tokenize(fn.body);
    let retVal = undefined;
    const err  = execute(bodyTokens, local, fns, leiaDefaults, 1, v => { retVal = v; });
    if (err) { output += err + '\n'; error = true; }
    return retVal;
  }

  /* ── Executor principal ── */
  function execute(tkList, ctx, registry, defaults, depth, onReturn) {
    if (depth > 300) return '❌ Erro: profundidade máxima de chamadas atingida.';
    let i = 0;

    while (i < tkList.length) {
      const line = tkList[i];

      /* RETORNE */
      if (/
^
RETORNE\s+/i.test(line)) {
        const val = evalExpr(line.replace(/
^
RETORNE\s+/i, ''), ctx);
        if (onReturn) onReturn(val);
        return null;
      }

      /* ESCREVA */
      if (/
^
ESCREVA\s*|
$
/i.test(line)) {
        const inner = line.replace(/
^
ESCREVA\s*|
$
/i, '').replace(/
$
|\s*
$
/, '');
        output += joinArgs(inner, ctx) + '\n';
        i++; continue;
      }

      /* LEIA */
      if (/
^
LEIA\s*|
$
/i.test(line)) {
        const m = line.match(/
^
LEIA\s*|
$
\s*(\w+)(?:\s*:\s*(.+?))?\s*
$
|
$
/i);
        if (m) {
          const vn = m[1];
          ctx[vn.toUpperCase()] = ctx[vn] =
            m[2] !== undefined ? parseValue(m[2], ctx) : (defaults[vn] ?? '');
        }
        i++; continue;
      }

      /* Atribuição simples: x <- expr */
      const atribSimple = line.match(/
^
([A-Za-zÀ-ú_]\w*)\s*<-\s*(.+)
$
/);
      if (atribSimple && !/
^
|
$
/.test(atribSimple[1])) {
        ctx[atribSimple[1].toUpperCase()] = ctx[atribSimple[1]] = evalExpr(atribSimple[2], ctx);
        i++; continue;
      }

      /* Atribuição de vetor: v[i] <- expr */
      const atribArr = line.match(/
^
([A-Za-zÀ-ú_]\w*)\s*|
$
\s*(.+?)\s*
$
|\s*<-\s*(.+)
$
/);
      if (atribArr) {
        const arrName = atribArr[1];
        const idx     = Math.round(evalExpr(atribArr[2], ctx)) - 1;
        const val     = evalExpr(atribArr[3], ctx);
        if (!Array.isArray(ctx[arrName])) ctx[arrName] = [];
        ctx[arrName][idx] = val;
        ctx[arrName.toUpperCase()] = ctx[arrName];
        i++; continue;
      }

      /* SE ... ENTÃO */
      if (/
^
SE\s+.+\s+ENTÃO
$
/i.test(line)) {
        const cond = line.replace(/
^
SE\s+/i, '').replace(/\s+ENTÃO
$
/i, '');
        const thenBlock = []; let elseBlock = null; let d = 1; i++;
        while (i < tkList.length && d > 0) {
          const lt = tkList[i];
          if (/
^
SE\s+/i.test(lt)) d++;
          if (/
^
FIM_SE
$
/i.test(lt)) {
            d--; if (!d) { i++; break; }
          }
          if (d === 1 && /
^
SENÃO
$
/i.test(lt)) { elseBlock = []; i++; continue; }
          if (d === 1 && /
^
SENÃO\s+SE\s+/i.test(lt)) {
            if (!elseBlock) elseBlock = [];
            elseBlock.push(lt); i++; continue;
          }
          (elseBlock !== null ? elseBlock : thenBlock).push(lt);
          i++;
        }
        const r = execute(
          evalCond(cond, ctx) ? thenBlock : (elseBlock ?? []),
          ctx, registry, defaults, depth + 1, onReturn
        );
        if (r) return r;
        continue;
      }
      if (/
^
(SENÃO|FIM_SE)
$
/i.test(line)) { i++; continue; }

      /* PARA i DE x ATÉ y [PASSO z] FAÇA */
      const forM = line.match(/
^
PARA\s+(\w+)\s+DE\s+(.+?)\s+ATÉ\s+(.+?)(?:\s+PASSO\s+(.+?))?\s+FAÇA
$
/i);
      if (forM) {
        const vn   = forM[1];
        const from = Number(evalExpr(forM[2], ctx));
        const to   = Number(evalExpr(forM[3], ctx));
        const step = forM[4] ? Number(evalExpr(forM[4], ctx)) : 1;
        const body = []; let d = 1; i++;
        while (i < tkList.length && d > 0) {
          const lt = tkList[i];
          if (/
^
PARA\s+/i.test(lt)) d++;
          if (/
^
FIM_PARA
$
/i.test(lt)) { d--; if (!d) { i++; break; } }
          body.push(lt); i++;
        }
        let guard = 0;
        for (let v = from; v <= to; v += step) {
          if (++guard > 50000) return '❌ Erro: loop PARA excedeu limite de iterações.';
          ctx[vn.toUpperCase()] = ctx[vn] = v;
          const r = execute(body, ctx, registry, defaults, depth + 1, onReturn);
          if (r) return r;
        }
        continue;
      }
      if (/
^
FIM_PARA
$
/i.test(line)) { i++; continue; }

      /* ENQUANTO cond FAÇA */
      const whileM = line.match(/
^
ENQUANTO\s+(.+?)\s+FAÇA
$
/i);
      if (whileM) {
        const cond = whileM[1];
        const body = []; let d = 1; i++;
        while (i < tkList.length && d > 0) {
          const lt = tkList[i];
          if (/
^
ENQUANTO\s+/i.test(lt)) d++;
          if (/
^
FIM_ENQUANTO
$
/i.test(lt)) { d--; if (!d) { i++; break; } }
          body.push(lt); i++;
        }
        let guard = 0;
        while (evalCond(cond, ctx)) {
          if (++guard > 50000) return '❌ Erro: loop ENQUANTO excedeu limite.';
          const r = execute(body, ctx, registry, defaults, depth + 1, onReturn);
          if (r) return r;
        }
        continue;
      }
      if (/
^
FIM_ENQUANTO
$
/i.test(line)) { i++; continue; }

      /* REPITA ... ATÉ cond */
      if (/
^
REPITA
$
/i.test(line)) {
        const body = []; i++;
        while (i < tkList.length && !/
^
ATÉ\s+/i.test(tkList[i])) {
          body.push(tkList[i]); i++;
        }
        const cond = tkList[i]?.replace(/
^
ATÉ\s+/i, '') ?? 'VERDADEIRO';
        i++;
        let guard = 0;
        do {
          if (++guard > 50000) return '❌ Erro: loop REPITA excedeu limite.';
          const r = execute(body, ctx, registry, defaults, depth + 1, onReturn);
          if (r) return r;
        } while (!evalCond(cond, ctx));
        continue;
      }

      /* Chamada de procedimento: nome(args) */
      const procCall = line.match(/
^
([A-Za-zÀ-ú_]\w*)\s*|
$
(.*)?
$
|
$
/);
      if (procCall && fns[procCall[1].toUpperCase()]) {
        callFunction(procCall[1], procCall[2] || '', ctx);
        i++; continue;
      }

      i++;
    }
    return null;
  }
}