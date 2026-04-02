import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function normalizeDoc(doc) {
  return {
    _id: doc._id.toString(),
    numeroNote: doc.numeroNote || "",
    patrimonio: doc.patrimonio || "",
    modelo: doc.modelo || "",
    ns: doc.ns || "",
    responsavelAluno: doc.responsavelAluno || "",
    sala: doc.sala || "",
    status: doc.status || "Em uso",
    gravidade: doc.gravidade || "Sem avaria",
    avariasFisicas: doc.avariasFisicas || "Não",
    formatacao: doc.formatacao || "Não",
    chamado: doc.chamado || "Não",
    dataVerificacao: doc.dataVerificacao || "",
    descricaoAvarias: doc.descricaoAvarias || "",
    historico: doc.historico || "",
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  };
}

export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection("notebooks")
      .find({})
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    return Response.json(items.map(normalizeDoc), { status: 200 });
  } catch (error) {
    return Response.json(
      { error: "Erro ao buscar registros.", detalhe: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.numeroNote?.trim() || !body.ns?.trim()) {
      return Response.json(
        { error: "Número do note e NS são obrigatórios." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const novoRegistro = {
      numeroNote: String(body.numeroNote || "").trim(),
      patrimonio: String(body.patrimonio || "").trim(),
      modelo: String(body.modelo || "").trim(),
      ns: String(body.ns || "").trim(),
      responsavelAluno: String(body.responsavelAluno || "").trim(),
      sala: String(body.sala || "").trim(),
      status: String(body.status || "Em uso"),
      gravidade: String(body.gravidade || "Sem avaria"),
      avariasFisicas: String(body.avariasFisicas || "Não"),
      formatacao: String(body.formatacao || "Não"),
      chamado: String(body.chamado || "Não"),
      dataVerificacao: String(body.dataVerificacao || ""),
      descricaoAvarias: String(body.descricaoAvarias || "").trim(),
      historico: String(body.historico || "").trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("notebooks").insertOne(novoRegistro);
    return Response.json(
      { message: "Registro salvo com sucesso.", insertedId: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { error: "Erro ao salvar registro.", detalhe: error.message },
      { status: 500 }
    );
  }
}
