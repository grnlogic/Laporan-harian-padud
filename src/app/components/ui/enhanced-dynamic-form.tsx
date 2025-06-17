"use client";

import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Card, CardContent } from "./card";
import { Trash2, GripVertical } from "lucide-react";

interface FormRow {
  id: string;
  description: string;
  amount: number;
}

interface EnhancedDynamicFormProps {
  title: string;
  subtitle: string;
  buttonText: string;
  rows: FormRow[];
  onRowsChange: (rows: FormRow[]) => void;
  currency?: boolean;
  unit?: string;
  sectionColor?: "blue" | "green" | "orange" | "purple" | "red";
}

export function EnhancedDynamicForm({
  title,
  subtitle,
  buttonText,
  rows,
  onRowsChange,
  currency = false,
  unit = "",
  sectionColor = "blue",
}: EnhancedDynamicFormProps) {
  const colorClasses = {
    blue: {
      button: "bg-blue-500 hover:bg-blue-600 text-white",
      border: "border-blue-200",
      text: "text-blue-600",
      bg: "bg-blue-50",
    },
    green: {
      button: "bg-green-500 hover:bg-green-600 text-white",
      border: "border-green-200",
      text: "text-green-600",
      bg: "bg-green-50",
    },
    orange: {
      button: "bg-orange-500 hover:bg-orange-600 text-white",
      border: "border-orange-200",
      text: "text-orange-600",
      bg: "bg-orange-50",
    },
    purple: {
      button: "bg-purple-500 hover:bg-purple-600 text-white",
      border: "border-purple-200",
      text: "text-purple-600",
      bg: "bg-purple-50",
    },
    red: {
      button: "bg-red-500 hover:bg-red-600 text-white",
      border: "border-red-200",
      text: "text-red-600",
      bg: "bg-red-50",
    },
  };

  const colors = colorClasses[sectionColor];

  const addRow = () => {
    const newRow: FormRow = {
      id: Date.now().toString(),
      description: "",
      amount: 0,
    };
    onRowsChange([...rows, newRow]);
  };

  const updateRow = (
    id: string,
    field: keyof FormRow,
    value: string | number
  ) => {
    const updatedRows = rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    onRowsChange(updatedRows);
  };

  const deleteRow = (id: string) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    onRowsChange(updatedRows);
  };

  const formatNumber = (value: number) => {
    if (currency) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString("id-ID");
  };

  const totalAmount = rows.reduce((sum, row) => sum + (row.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h4 className={`text-sm font-semibold ${colors.text}`}>{title}</h4>
        <p className="text-xs text-gray-600">{subtitle}</p>
      </div>

      {/* Add Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className={`w-full ${colors.button} border-dashed border-2 h-10`}
      >
        {buttonText}
      </Button>

      {/* Form Rows - Mobile Optimized */}
      {rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((row, index) => (
            <Card key={row.id} className={`${colors.border} ${colors.bg}`}>
              <CardContent className="p-3">
                {/* Mobile Layout: Stack vertically */}
                <div className="space-y-3">
                  {/* Row Header with Index and Delete */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        Item {index + 1}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRow(row.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Description Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Keterangan
                    </label>
                    <Textarea
                      placeholder="Masukkan keterangan..."
                      value={row.description}
                      onChange={(e) =>
                        updateRow(row.id, "description", e.target.value)
                      }
                      className="min-h-[60px] text-sm resize-none"
                    />
                  </div>

                  {/* Amount Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Jumlah {unit && `(${unit})`}
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0"
                        value={row.amount || ""}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "amount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="text-sm pr-12"
                      />
                      {unit && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-xs text-gray-500">{unit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Total Summary - Mobile Optimized */}
          <Card className={`${colors.bg} ${colors.border}`}>
            <CardContent className="p-3">
              <div className="text-center space-y-1">
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(totalAmount)}
                </div>
                <div className="text-xs text-gray-600">
                  Total {title}: {rows.length} item
                  {rows.length !== 1 ? "s" : ""}
                  {unit && ` • ${unit}`}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
