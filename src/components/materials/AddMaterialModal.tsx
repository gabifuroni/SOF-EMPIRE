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
  { value: 'clientes', label: 'clientes' },
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

  const handleSubmit = async (data: FormData) => {
    try {
      await onSave(data);
      // Resetar o form apenas após sucesso
      form.reset();
      setUnitCost(0);
    } catch (error) {
      console.error('Error saving material:', error);
      // Não resetar em caso de erro para manter os dados preenchidos
    }
  };

  const handleClose = () => {
    form.reset();
    setUnitCost(0);
    onClose();
  };

  const inputStyle: React.CSSProperties = { width: '100%', background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '10px 14px', color: '#f0f0f8', fontSize: 14, outline: 'none', fontFamily: 'Sora, sans-serif', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#9090a8', marginBottom: 6, display: 'block' };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, color: '#f0f0f8' }}>
        <style>{`
          .mat-input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 2px rgba(201,168,76,0.15) !important; }
          .mat-input::placeholder { color: #606078 !important; }
          .mat-select option { background: #1c1c26; color: #f0f0f8; }
        `}</style>

        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: '#f0f0f8' }}>
            {title}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>

            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <label style={labelStyle}>Nome do Produto/Material *</label>
                  <FormControl>
                    <input
                      className="mat-input"
                      style={inputStyle}
                      placeholder="Ex: Esmalte Premium Rosa"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage style={{ color: '#ff4d6a', fontSize: 12 }} />
                </FormItem>
              )}
            />

            {/* Quantidade + Unidade */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField
                control={form.control}
                name="batchQuantity"
                render={({ field }) => (
                  <FormItem>
                    <label style={labelStyle}>Quantidade por Lote *</label>
                    <FormControl>
                      <input
                        className="mat-input"
                        style={inputStyle}
                        type="number"
                        step="0.01"
                        placeholder="Ex: 100"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage style={{ color: '#ff4d6a', fontSize: 12 }} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <label style={labelStyle}>Unidade da Quantidade *</label>
                    <FormControl>
                      <select
                        className="mat-input mat-select"
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {UNIT_OPTIONS.map((unit) => (
                          <option key={unit.value} value={unit.value}>{unit.label}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage style={{ color: '#ff4d6a', fontSize: 12 }} />
                  </FormItem>
                )}
              />
            </div>

            {/* Valor */}
            <FormField
              control={form.control}
              name="batchPrice"
              render={({ field }) => (
                <FormItem>
                  <label style={labelStyle}>Valor Pago no Lote/Embalagem (R$) *</label>
                  <FormControl>
                    <input
                      className="mat-input"
                      style={inputStyle}
                      type="number"
                      step="0.01"
                      placeholder="Ex: 50.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage style={{ color: '#ff4d6a', fontSize: 12 }} />
                </FormItem>
              )}
            />

            {/* Custo Unitário */}
            {unitCost > 0 && (
              <div style={{ background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6 }}>
                  💡 Custo Unitário Estimado
                </p>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#00c896', fontFamily: 'Sora, sans-serif' }}>
                  R$ {unitCost.toFixed(4)} por {form.watch('unit')}
                </p>
                <p style={{ fontSize: 12, color: '#606078', marginTop: 4 }}>
                  Este valor será usado nos cálculos de precificação dos seus serviços
                </p>
              </div>
            )}

            {/* Botões */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button
                type="submit"
                style={{ flex: 1, background: 'linear-gradient(135deg,#00c896,#00a07a)', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, color: '#0a0a0f', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
              >
                {initialData ? 'Salvar Alterações' : 'Salvar Matéria-Prima'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a38', borderRadius: 10, padding: '12px', fontSize: 14, color: '#9090a8', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaterialModal;
