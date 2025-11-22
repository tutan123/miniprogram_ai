import ProductForm from "@/components/ProductForm";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: Number(params.id) }
  })

  if (!product) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">编辑商品</h1>
      <ProductForm product={product} />
    </div>
  )
}

