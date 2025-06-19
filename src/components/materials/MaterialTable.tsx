
import { Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Material } from '@/types';

interface MaterialTableProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
}

const MaterialTable = ({ materials, onEdit, onDelete }: MaterialTableProps) => {
  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-elite-charcoal-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="font-playfair text-xl text-elite-charcoal-700 mb-2">
          Nenhuma matéria-prima cadastrada
        </h3>
        <p className="text-elite-charcoal-500">
          Que tal adicionar a primeira matéria-prima ao seu inventário?
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-elite-pearl-300">
            <TableHead className="font-medium text-elite-charcoal-700">
              Nome do Produto/Material
            </TableHead>
            <TableHead className="font-medium text-elite-charcoal-700">
              Quantidade por Lote
            </TableHead>
            <TableHead className="font-medium text-elite-charcoal-700">
              Valor Pago no Lote
            </TableHead>
            <TableHead className="font-medium text-elite-charcoal-700">
              Unidade de Medida
            </TableHead>
            <TableHead className="font-medium text-elite-charcoal-700 text-center">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material, index) => (
            <TableRow 
              key={material.id} 
              className={`border-elite-pearl-200 hover:bg-elite-pearl-50 ${
                index % 2 === 0 ? 'bg-white' : 'bg-elite-pearl-25'
              }`}
            >
              <TableCell className="font-medium text-elite-charcoal-800">
                {material.name}
              </TableCell>
              <TableCell className="text-elite-charcoal-600">
                {material.batchQuantity} {material.unit}
              </TableCell>
              <TableCell className="text-elite-charcoal-600">
                R$ {material.batchPrice.toFixed(2)}
              </TableCell>
              <TableCell className="font-medium text-elite-rose-600">
                R$ {material.unitCost.toFixed(4)} / {material.unit}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(material)}
                    className="h-8 w-8 p-0 text-elite-charcoal-600 hover:text-elite-rose-600 hover:bg-elite-rose-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-elite-charcoal-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir "{material.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(material.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MaterialTable;
