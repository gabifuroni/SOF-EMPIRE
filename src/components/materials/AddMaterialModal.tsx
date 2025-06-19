import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  batchQuantity: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  batchPrice: z.number().min(0.01, 'Valor deve ser maior que zero'),
});

type FormData = z.infer<typeof formSchema>;
type MaterialFormData = FormData;

const UNIT_OPTIONS = [
  { value: 'ml', label: 'ml (mililitros)' },
  { value: 'g', label: 'g (gramas)' },
  { value: 'kg', label: 'kg (quilogramas)' },
  { value: 'unidades', label: 'unidades' },
  { value: 'peças', label: 'peças' },
  { value: 'pares', label: 'pares' },
  { value: 'metros', label: 'metros' },
  { value: 'cm', label: 'cm (centímetros)' },
];

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MaterialFormData) => void;
  title: string;
  initialData?: MaterialFormData;
}

const AddMaterialModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  title, 
  initialData 
}: AddMaterialModalProps) => {
  const [unitCost, setUnitCost] = useState<number>(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      batchQuantity: initialData?.batchQuantity || 0,
      unit: initialData?.unit || '',
      batchPrice: initialData?.batchPrice || 0,
    },
  });

  const watchedValues = form.watch(['batchQuantity', 'batchPrice']);

  useEffect(() => {
    const [quantity, price] = watchedValues;
    if (quantity > 0 && price > 0) {
      setUnitCost(price / quantity);
    } else {
      setUnitCost(0);
    }
  }, [watchedValues]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        batchQuantity: initialData.batchQuantity,
        unit: initialData.unit,
        batchPrice: initialData.batchPrice,
      });
    } else {
      form.reset({
        name: '',
        batchQuantity: 0,
        unit: '',
        batchPrice: 0,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: FormData) => {
    onSave(data);
    form.reset();
    setUnitCost(0);
  };

  const handleClose = () => {
    form.reset();
    setUnitCost(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="brand-heading text-xl text-symbol-black">
            {title}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                    Nome do Produto/Material *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Esmalte Premium Rosa"
                      className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige text-symbol-black"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="batchQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                      Quantidade por Lote *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="Ex: 100"
                        className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige text-symbol-black"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                      Unidade da Quantidade *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIT_OPTIONS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="batchPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
                    Valor Pago no Lote/Embalagem (R$) *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="Ex: 50.00"
                      className="mt-2 bg-symbol-gray-50 border-symbol-gray-300 focus:border-symbol-beige text-symbol-black"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {unitCost > 0 && (
              <div className="symbol-card p-4 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
                <h4 className="brand-subheading text-symbol-black text-sm uppercase tracking-wide mb-2">
                  💡 Custo Unitário Estimado
                </h4>
                <p className="text-emerald-600 font-semibold text-lg">
                  R$ {unitCost.toFixed(4)} por {form.watch('unit')}
                </p>
                <p className="brand-body text-symbol-gray-600 text-sm mt-1">
                  Este valor será usado nos cálculos de precificação dos seus serviços
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="border-symbol-gray-300 text-symbol-gray-700 hover:bg-symbol-gray-50 font-light"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light"
              >
                {initialData ? 'Salvar Alterações' : 'Salvar Matéria-Prima'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaterialModal;
