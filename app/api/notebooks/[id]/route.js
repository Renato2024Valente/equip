import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

function parseId(id) {
  if (!ObjectId.isValid(id)) {
    throw new Error("ID inválido.");
  }
  return new ObjectId(id);
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!body.numeroNote?.trim() || !body.ns?.trim()) {
      return Response.json(
        { error: "Número do note e NS são obrigatórios." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.collection("notebooks").updateOne(
      { _id: parseId(id) },
      {
        $set: {
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
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return Response.json({ error: "Registro não encontrado." }, { status: 404 });
    }

    return Response.json({ message: "Registro atualizado com sucesso." }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: "Erro ao atualizar registro.", detalhe: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, context) {
  try {
    const { id } = await context.params;
    const db = await getDb();

    const result = await db.collection("notebooks").deleteOne({ _id: parseId(id) });

    if (!result.deletedCount) {
      return Response.json({ error: "Registro não encontrado." }, { status: 404 });
    }

    return Response.json({ message: "Registro excluído com sucesso." }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: "Erro ao excluir registro.", detalhe: error.message },
      { status: 500 }
    );
  }
}
