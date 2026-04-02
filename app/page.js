"use client";

import { useEffect, useMemo, useState } from "react";

const vazio = {
  numeroNote: "",
  patrimonio: "",
  modelo: "",
  ns: "",
  responsavelAluno: "",
  sala: "",
  status: "Em uso",
  gravidade: "Sem avaria",
  avariasFisicas: "Não",
  formatacao: "Não",
  chamado: "Não",
  dataVerificacao: "",
  descricaoAvarias: "",
  historico: "",
};

export default function HomePage() {
  const [form, setForm] = useState(vazio);
  const [registros, setRegistros] = useState([]);
  const [filtros, setFiltros] = useState({
    texto: "",
    status: "",
    avariasFisicas: "",
    formatacao: "",
    chamado: "",
  });
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setForm((prev) => ({ ...prev, dataVerificacao: hojeISO() }));
    buscarRegistros();
  }, []);

  async function buscarRegistros() {
    try {
      setLoading(true);
      setErro("");
      const resp = await fetch("/api/notebooks", { cache: "no-store" });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.error || "Erro ao buscar registros");
      setRegistros(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }

  function hojeISO() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  function handleInput(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFiltro(e) {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  }

  function limparFormulario() {
    setEditId("");
    setForm({ ...vazio, dataVerificacao: hojeISO() });
  }

  async function salvarRegistro(e) {
    e.preventDefault();

    if (!form.numeroNote.trim()) {
      alert("Preencha o número do note.");
      return;
    }

    if (!form.ns.trim()) {
      alert("Preencha o número de série (NS).");
      return;
    }

    try {
      setSaving(true);
      setErro("");

      const metodo = editId ? "PUT" : "POST";
      const url = editId ? `/api/notebooks/${editId}` : "/api/notebooks";

      const resp = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.error || "Erro ao salvar registro");

      await buscarRegistros();
      limparFormulario();
      alert(editId ? "Registro atualizado com sucesso." : "Registro salvo com sucesso.");
    } catch (e) {
      setErro(e.message);
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  function editar(item) {
    setEditId(item._id);
    setForm({
      numeroNote: item.numeroNote || "",
      patrimonio: item.patrimonio || "",
      modelo: item.modelo || "",
      ns: item.ns || "",
      responsavelAluno: item.responsavelAluno || "",
      sala: item.sala || "",
      status: item.status || "Em uso",
      gravidade: item.gravidade || "Sem avaria",
      avariasFisicas: item.avariasFisicas || "Não",
      formatacao: item.formatacao || "Não",
      chamado: item.chamado || "Não",
      dataVerificacao: item.dataVerificacao || hojeISO(),
      descricaoAvarias: item.descricaoAvarias || "",
      historico: item.historico || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function excluir(id) {
    if (!confirm("Deseja excluir este registro?")) return;

    try {
      const resp = await fetch(`/api/notebooks/${id}`, { method: "DELETE" });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.error || "Erro ao excluir registro");
      await buscarRegistros();
    } catch (e) {
      setErro(e.message);
      alert(e.message);
    }
  }

  function exportarCSV() {
    const linhas = [
      [
        "NumeroNote",
        "Patrimonio",
        "Modelo",
        "NS",
        "Aluno",
        "Sala",
        "Status",
        "AvariasFisicas",
        "DescricaoAvarias",
        "Formatacao",
        "ChamadoTecnico",
        "Gravidade",
        "DataVerificacao",
        "Historico",
      ],
      ...filtrados.map((i) => [
        i.numeroNote || "",
        i.patrimonio || "",
        i.modelo || "",
        i.ns || "",
        i.responsavelAluno || "",
        i.sala || "",
        i.status || "",
        i.avariasFisicas || "",
        i.descricaoAvarias || "",
        i.formatacao || "",
        i.chamado || "",
        i.gravidade || "",
        i.dataVerificacao || "",
        i.historico || "",
      ]),
    ];

    const csv = linhas
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "controle_notebooks.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtrados = useMemo(() => {
    return registros.filter((item) => {
      const blob = [
        item.numeroNote,
        item.patrimonio,
        item.modelo,
        item.ns,
        item.responsavelAluno,
        item.sala,
        item.status,
        item.descricaoAvarias,
        item.historico,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!filtros.texto || blob.includes(filtros.texto.toLowerCase())) &&
        (!filtros.status || item.status === filtros.status) &&
        (!filtros.avariasFisicas || item.avariasFisicas === filtros.avariasFisicas) &&
        (!filtros.formatacao || item.formatacao === filtros.formatacao) &&
        (!filtros.chamado || item.chamado === filtros.chamado)
      );
    });
  }, [registros, filtros]);

  const stats = useMemo(() => {
    return {
      total: registros.length,
      avarias: registros.filter((i) => i.avariasFisicas === "Sim").length,
      formatacao: registros.filter((i) => i.formatacao === "Sim").length,
      chamado: registros.filter((i) => i.chamado === "Sim").length,
    };
  }, [registros]);

  function badgeClass(texto) {
    const value = String(texto || "").toLowerCase();
    if (["sim", "grave", "em manutenção", "aguardando peça"].includes(value)) return "tag danger";
    if (["leve", "média", "media", "baixado"].includes(value)) return "tag warn";
    if (["não", "nao", "em uso"].includes(value)) return "tag ok";
    return "tag info";
  }

  function rowClass(item) {
    const classes = [];
    if (item.gravidade === "Leve") classes.push("rowLeve");
    if (item.gravidade === "Média") classes.push("rowMedia");
    if (item.gravidade === "Grave") classes.push("rowGrave");
    if (item.formatacao === "Sim") classes.push("rowFormatar");
    if (item.chamado === "Sim") classes.push("rowChamado");
    return classes.join(" ");
  }

  return (
    <main className="wrap">
      <section className="topo">
        <h1>Controle de Notebooks</h1>
        <p className="subtitle">
          Sistema completo com Next.js + MongoDB para cadastro, edição, filtro,
          exclusão e exportação.
        </p>
      </section>

      {erro ? <div className="alertaErro">{erro}</div> : null}

      <section className="gridStats">
        <CardStat titulo="Total de notebooks" valor={stats.total} />
        <CardStat titulo="Com avarias" valor={stats.avarias} />
        <CardStat titulo="Para formatação" valor={stats.formatacao} />
        <CardStat titulo="Com chamado" valor={stats.chamado} />
      </section>

      <section className="card">
        <h2>Cadastro / Edição</h2>
        <form onSubmit={salvarRegistro}>
          <div className="formGrid">
            <Campo label="Número do note">
              <input name="numeroNote" value={form.numeroNote} onChange={handleInput} placeholder="Ex.: 12" />
            </Campo>
            <Campo label="Patrimônio">
              <input name="patrimonio" value={form.patrimonio} onChange={handleInput} placeholder="Ex.: 00123" />
            </Campo>
            <Campo label="Modelo">
              <input name="modelo" value={form.modelo} onChange={handleInput} placeholder="Ex.: Dell 5400" />
            </Campo>
            <Campo label="Nº de Série (NS)">
              <input name="ns" value={form.ns} onChange={handleInput} placeholder="Ex.: ABC123XYZ" />
            </Campo>

            <Campo label="Aluno / Responsável">
              <input name="responsavelAluno" value={form.responsavelAluno} onChange={handleInput} placeholder="Nome do aluno" />
            </Campo>
            <Campo label="Sala / Turma">
              <input name="sala" value={form.sala} onChange={handleInput} placeholder="Ex.: 2º EM A" />
            </Campo>
            <Campo label="Status">
              <select name="status" value={form.status} onChange={handleInput}>
                <option>Em uso</option>
                <option>Em manutenção</option>
                <option>Aguardando peça</option>
                <option>Baixado</option>
              </select>
            </Campo>
            <Campo label="Classificação da avaria">
              <select name="gravidade" value={form.gravidade} onChange={handleInput}>
                <option>Sem avaria</option>
                <option>Leve</option>
                <option>Média</option>
                <option>Grave</option>
              </select>
            </Campo>

            <Campo label="Avarias físicas?">
              <select name="avariasFisicas" value={form.avariasFisicas} onChange={handleInput}>
                <option>Não</option>
                <option>Sim</option>
              </select>
            </Campo>
            <Campo label="Vai para formatação?">
              <select name="formatacao" value={form.formatacao} onChange={handleInput}>
                <option>Não</option>
                <option>Sim</option>
              </select>
            </Campo>
            <Campo label="Chamado técnico?">
              <select name="chamado" value={form.chamado} onChange={handleInput}>
                <option>Não</option>
                <option>Sim</option>
              </select>
            </Campo>
            <Campo label="Data da verificação">
              <input type="date" name="dataVerificacao" value={form.dataVerificacao} onChange={handleInput} />
            </Campo>

            <Campo label="Descrição das avarias" full>
              <textarea
                name="descricaoAvarias"
                value={form.descricaoAvarias}
                onChange={handleInput}
                placeholder="Ex.: tela trincada, tecla faltando, carcaça rachada..."
              />
            </Campo>

            <Campo label="Histórico / observações" full>
              <textarea
                name="historico"
                value={form.historico}
                onChange={handleInput}
                placeholder="Ex.: já foi para manutenção em março, retornou formatado, bateria fraca..."
              />
            </Campo>
          </div>

          <div className="actions">
            <button type="submit" className="btn ok" disabled={saving}>
              {saving ? "Salvando..." : editId ? "Atualizar registro" : "Salvar registro"}
            </button>
            <button type="button" className="btn soft" onClick={limparFormulario}>
              Limpar formulário
            </button>
            <button type="button" className="btn warn" onClick={exportarCSV}>
              Exportar CSV
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Filtros</h2>
        <div className="filters">
          <Campo label="Pesquisar">
            <input
              name="texto"
              value={filtros.texto}
              onChange={handleFiltro}
              placeholder="Número, patrimônio, NS, aluno, sala..."
            />
          </Campo>

          <Campo label="Status">
            <select name="status" value={filtros.status} onChange={handleFiltro}>
              <option value="">Todos</option>
              <option>Em uso</option>
              <option>Em manutenção</option>
              <option>Aguardando peça</option>
              <option>Baixado</option>
            </select>
          </Campo>

          <Campo label="Avarias">
            <select name="avariasFisicas" value={filtros.avariasFisicas} onChange={handleFiltro}>
              <option value="">Todos</option>
              <option>Sim</option>
              <option>Não</option>
            </select>
          </Campo>

          <Campo label="Formatação">
            <select name="formatacao" value={filtros.formatacao} onChange={handleFiltro}>
              <option value="">Todos</option>
              <option>Sim</option>
              <option>Não</option>
            </select>
          </Campo>

          <Campo label="Chamado">
            <select name="chamado" value={filtros.chamado} onChange={handleFiltro}>
              <option value="">Todos</option>
              <option>Sim</option>
              <option>Não</option>
            </select>
          </Campo>
        </div>
      </section>

      <section className="card">
        <h2>Registros</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Nº Note</th>
                  <th>Patrimônio</th>
                  <th>Modelo</th>
                  <th>NS</th>
                  <th>Aluno</th>
                  <th>Sala</th>
                  <th>Status</th>
                  <th>Avarias</th>
                  <th>Descrição</th>
                  <th>Formatação</th>
                  <th>Chamado</th>
                  <th>Gravidade</th>
                  <th>Data</th>
                  <th>Histórico</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length ? (
                  filtrados.map((item) => (
                    <tr key={item._id} className={rowClass(item)}>
                      <td>{item.numeroNote || "-"}</td>
                      <td>{item.patrimonio || "-"}</td>
                      <td>{item.modelo || "-"}</td>
                      <td>{item.ns || "-"}</td>
                      <td>{item.responsavelAluno || "-"}</td>
                      <td>{item.sala || "-"}</td>
                      <td><span className={badgeClass(item.status)}>{item.status || "-"}</span></td>
                      <td><span className={badgeClass(item.avariasFisicas)}>{item.avariasFisicas || "-"}</span></td>
                      <td>{item.descricaoAvarias || "-"}</td>
                      <td><span className={badgeClass(item.formatacao)}>{item.formatacao || "-"}</span></td>
                      <td><span className={badgeClass(item.chamado)}>{item.chamado || "-"}</span></td>
                      <td><span className={badgeClass(item.gravidade)}>{item.gravidade || "-"}</span></td>
                      <td>{item.dataVerificacao || "-"}</td>
                      <td>{item.historico || "-"}</td>
                      <td>
                        <div className="actionsInline">
                          <button className="btn soft mini" onClick={() => editar(item)}>Editar</button>
                          <button className="btn danger mini" onClick={() => excluir(item._id)}>Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="15">Nenhum registro encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style jsx>{`
        .wrap {
          max-width: 1450px;
          margin: 0 auto;
          padding: 20px;
        }
        .topo h1 {
          margin: 0 0 8px;
        }
        .subtitle {
          color: var(--muted);
          margin: 0 0 18px;
        }
        .alertaErro {
          margin-bottom: 16px;
          background: rgba(239, 68, 68, 0.12);
          color: #fecaca;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 12px;
          border-radius: 12px;
        }
        .gridStats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }
        .card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,.25);
          margin-bottom: 18px;
        }
        .formGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .filters {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 12px;
        }
        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 16px;
        }
        .actionsInline {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .btn {
          border: none;
          border-radius: 12px;
          padding: 11px 14px;
          cursor: pointer;
          font-weight: 700;
          color: white;
        }
        .btn.ok { background: linear-gradient(135deg, #16a34a, #15803d); }
        .btn.soft { background: #1e293b; }
        .btn.warn { background: linear-gradient(135deg, #d97706, #b45309); }
        .btn.danger { background: linear-gradient(135deg, #dc2626, #b91c1c); }
        .btn.mini { padding: 8px 10px; font-size: 12px; }
        .tableWrap {
          overflow: auto;
          border-radius: 18px;
          border: 1px solid var(--line);
        }
        table {
          width: 100%;
          min-width: 1450px;
          border-collapse: collapse;
          background: rgba(15, 23, 42, .9);
        }
        th, td {
          padding: 10px;
          border-bottom: 1px solid #243244;
          text-align: left;
          vertical-align: top;
          font-size: 14px;
        }
        th {
          background: #0b1220;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .tag {
          display: inline-block;
          padding: 4px 9px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid transparent;
        }
        .tag.ok { background: rgba(34,197,94,.12); color: #86efac; border-color: rgba(34,197,94,.2); }
        .tag.warn { background: rgba(245,158,11,.12); color: #fcd34d; border-color: rgba(245,158,11,.2); }
        .tag.danger { background: rgba(239,68,68,.12); color: #fca5a5; border-color: rgba(239,68,68,.2); }
        .tag.info { background: rgba(96,165,250,.12); color: #93c5fd; border-color: rgba(96,165,250,.2); }
        .rowLeve td { border-left: 4px solid #facc15; }
        .rowMedia td { border-left: 4px solid #fb923c; }
        .rowGrave td { border-left: 4px solid #ef4444; }
        .rowFormatar td { background: rgba(245,158,11,0.08); }
        .rowChamado td { background: rgba(96,165,250,0.08); }

        @media (max-width: 1100px) {
          .gridStats, .formGrid, .filters {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 700px) {
          .wrap { padding: 12px; }
          .gridStats, .formGrid, .filters {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

function CardStat({ titulo, valor }) {
  return (
    <div className="cardStat">
      <div className="titulo">{titulo}</div>
      <div className="valor">{valor}</div>

      <style jsx>{`
        .cardStat {
          background: rgba(17, 24, 39, 0.92);
          border: 1px solid #334155;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,.25);
        }
        .titulo {
          color: #94a3b8;
          margin-bottom: 8px;
        }
        .valor {
          font-size: 28px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

function Campo({ label, children, full = false }) {
  return (
    <div className={full ? "full" : ""}>
      <label>{label}</label>
      {children}
      <style jsx>{`
        div {
          display: block;
        }
        .full {
          grid-column: 1 / -1;
        }
        label {
          display: block;
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 6px;
        }
        :global(input), :global(select), :global(textarea) {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #334155;
          background: #0b1220;
          color: #e5e7eb;
          padding: 11px 12px;
          font-size: 14px;
        }
        :global(textarea) {
          min-height: 96px;
          resize: vertical;
        }
      `}</style>
    </div>
  );
}
