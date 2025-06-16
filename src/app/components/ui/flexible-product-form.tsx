"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Trash2, Plus } from "lucide-react";

interface ProductRow {
  id: string;
  productName: string;
  description: string;
  amount: number;
}

interface FlexibleProductFormProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  products: ProductRow[];
  onProductsChange: (products: ProductRow[]) => void;
  sectionColor?: "blue" | "green" | "yellow" | "red" | "purple";
}

const colorConfig = {
  blue: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-800",
    button: "bg-blue-600 hover:bg-blue-700",
    accent: "text-blue-600",
  },
  green: {
    border: "border-green-200",
    bg: "bg-green-50",
    text: "text-green-800",
    button: "bg-green-600 hover:bg-green-700",
    accent: "text-green-600",
  },
  yellow: {
    border: "border-yellow-200",
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    button: "bg-yellow-600 hover:bg-yellow-700",
    accent: "text-yellow-600",
  },
  red: {
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-800",
    button: "bg-red-600 hover:bg-red-700",
    accent: "text-red-600",
  },
  purple: {
    border: "border-purple-200",
    bg: "bg-purple-50",
    text: "text-purple-800",
    button: "bg-purple-600 hover:bg-purple-700",
    accent: "text-purple-600",
  },
};

export function FlexibleProductForm({
  title,
  subtitle,
  buttonText,
  products,
  onProductsChange,
  sectionColor = "blue",
}: FlexibleProductFormProps) {
  const colors = colorConfig[sectionColor];

  const addProduct = () => {
    const newProduct: ProductRow = {
      id: Date.now().toString(),
      productName: "",
      description: "",
      amount: 0,
    };
    onProductsChange([...products, newProduct]);
  };

  const updateProduct = (id: string, field: keyof ProductRow, value: string | number) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, [field]: value } : product
    );
    onProductsChange(updatedProducts);
  };

  const removeProduct = (id: string) => {
    const filteredProducts = products.filter((product) => product.id !== id);
    onProductsChange(filteredProducts);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAmountChange = (id: string, value: string) => {
    // Hapus semua karakter non-digit
    const numericValue = value.replace(/\D/g, "");
    const numericAmount = numericValue ? parseInt(numericValue) : 0;
    updateProduct(id, "amount", numericAmount);
  };

  return (
    <div className={`border rounded-lg p-4 ${colors.border} ${colors.bg}`}>
      <div className="mb-4">
        <h4 className={`font-semibold text-sm ${colors.text}`}>{title}</h4>
        {subtitle && (
          <p className={`text-xs mt-1 ${colors.text} opacity-80`}>{subtitle}</p>
        )}
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded-md border border-gray-200"
          >
            {/* Nama Produk */}
            <div className="col-span-3">
              <Label htmlFor={`productName-${product.id}`} className="text-xs font-medium">
                Nama Produk
              </Label>
              <Input
                id={`productName-${product.id}`}
                type="text"
                placeholder="Nama produk"
                value={product.productName}
                onChange={(e) => updateProduct(product.id, "productName", e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Deskripsi */}
            <div className="col-span-5">
              <Label htmlFor={`description-${product.id}`} className="text-xs font-medium">
                Deskripsi Penjualan
              </Label>
              <Input
                id={`description-${product.id}`}
                type="text"
                placeholder="Contoh: Penjualan ke Toko ABC"
                value={product.description}
                onChange={(e) => updateProduct(product.id, "description", e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Jumlah */}
            <div className="col-span-3">
              <Label htmlFor={`amount-${product.id}`} className="text-xs font-medium">
                Jumlah (Rp)
              </Label>
              <Input
                id={`amount-${product.id}`}
                type="text"
                placeholder="0"
                value={product.amount > 0 ? formatCurrency(product.amount) : ""}
                onChange={(e) => handleAmountChange(product.id, e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Tombol Hapus */}
            <div className="col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeProduct(product.id)}
                className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-sm">
            Belum ada produk yang ditambahkan
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addProduct}
          className={`w-full ${colors.button} text-white border-0`}
        >
          <Plus className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </div>

      {products.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700">Total Penjualan:</span>
            <span className={`font-bold ${colors.accent}`}>
              {formatCurrency(products.reduce((sum, product) => sum + product.amount, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}