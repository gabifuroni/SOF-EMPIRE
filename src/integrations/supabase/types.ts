export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categorias_despesas: {
        Row: {
          created_at: string
          id: string
          is_predefinida: boolean
          nome_categoria: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_predefinida?: boolean
          nome_categoria: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_predefinida?: boolean
          nome_categoria?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      config_formas_pagamento: {        Row: {
          created_at: string
          id: string
          is_ativo: boolean
          nome_metodo: string
          percentual_distribuicao: number
          prazo_recebimento_dias: number
          taxa_percentual: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_ativo?: boolean
          nome_metodo: string
          percentual_distribuicao?: number
          prazo_recebimento_dias?: number
          taxa_percentual?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_ativo?: boolean
          nome_metodo?: string
          percentual_distribuicao?: number
          prazo_recebimento_dias?: number
          taxa_percentual?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      despesas_diretas_valores: {
        Row: {
          categoria_id: string
          created_at: string
          id: string
          mes_referencia: string
          updated_at: string
          user_id: string
          valor_mensal: number
        }
        Insert: {
          categoria_id: string
          created_at?: string
          id?: string
          mes_referencia: string
          updated_at?: string
          user_id: string
          valor_mensal?: number
        }
        Update: {
          categoria_id?: string
          created_at?: string
          id?: string
          mes_referencia?: string
          updated_at?: string
          user_id?: string
          valor_mensal?: number
        }
        Relationships: [          {
            foreignKeyName: "despesas_diretas_valores_categoria_id_fkey",
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_despesas"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas_indiretas_categorias: {
        Row: {
          created_at: string
          id: string
          is_fixed: boolean
          is_predefinida: boolean
          nome_categoria_despesa: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_fixed?: boolean
          is_predefinida?: boolean
          nome_categoria_despesa: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_fixed?: boolean
          is_predefinida?: boolean
          nome_categoria_despesa?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      despesas_indiretas_valores: {
        Row: {
          categoria_id: string
          created_at: string
          id: string
          mes_referencia: string
          updated_at: string
          user_id: string
          valor_mensal: number
        }
        Insert: {
          categoria_id: string
          created_at?: string
          id?: string
          mes_referencia: string
          updated_at?: string
          user_id: string
          valor_mensal: number
        }
        Update: {
          categoria_id?: string
          created_at?: string
          id?: string
          mes_referencia?: string
          updated_at?: string
          user_id?: string
          valor_mensal?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_indiretas_valores_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "despesas_indiretas_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      materias_primas: {
        Row: {
          batch_price: number
          batch_quantity: number
          created_at: string
          id: string
          name: string
          unit: string
          unit_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_price: number
          batch_quantity: number
          created_at?: string
          id?: string
          name: string
          unit?: string
          unit_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_price?: number
          batch_quantity?: number
          created_at?: string
          id?: string
          name?: string
          unit?: string
          unit_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      metas_usuario: {
        Row: {
          created_at: string
          id: string
          meta_atendimentos_mensal: number | null
          tipo_meta: string
          updated_at: string
          user_id: string
          valor_meta_mensal: number
        }
        Insert: {
          created_at?: string
          id?: string
          meta_atendimentos_mensal?: number | null
          tipo_meta: string
          updated_at?: string
          user_id: string
          valor_meta_mensal?: number
        }
        Update: {
          created_at?: string
          id?: string
          meta_atendimentos_mensal?: number | null
          tipo_meta?: string
          updated_at?: string
          user_id?: string
          valor_meta_mensal?: number
        }
        Relationships: []
      }
      parametros_negocio: {
        Row: {
          created_at: string
          depreciacao_mensal: number
          depreciacao_total_mes_depreciado: number
          depreciacao_valor_mobilizado: number
          dias_trabalhados_ano: number
          equipe_numero_profissionais: number
          feriados: Json | null
          id: string
          lucro_desejado: number
          taxa_impostos: number
          taxa_media_ponderada: number
          trabalha_domingo: boolean
          trabalha_quarta: boolean
          trabalha_quinta: boolean
          trabalha_sabado: boolean
          trabalha_segunda: boolean
          trabalha_sexta: boolean
          trabalha_terca: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          depreciacao_mensal?: number
          depreciacao_total_mes_depreciado?: number
          depreciacao_valor_mobilizado?: number
          dias_trabalhados_ano?: number
          equipe_numero_profissionais?: number
          feriados?: Json | null
          id?: string
          lucro_desejado?: number
          taxa_impostos?: number
          taxa_media_ponderada?: number
          trabalha_domingo?: boolean
          trabalha_quarta?: boolean
          trabalha_quinta?: boolean
          trabalha_sabado?: boolean
          trabalha_segunda?: boolean
          trabalha_sexta?: boolean
          trabalha_terca?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          depreciacao_mensal?: number
          depreciacao_total_mes_depreciado?: number
          depreciacao_valor_mobilizado?: number
          dias_trabalhados_ano?: number
          equipe_numero_profissionais?: number
          feriados?: Json | null
          id?: string
          lucro_desejado?: number
          taxa_impostos?: number
          taxa_media_ponderada?: number
          trabalha_domingo?: boolean
          trabalha_quarta?: boolean
          trabalha_quinta?: boolean
          trabalha_sabado?: boolean
          trabalha_segunda?: boolean
          trabalha_sexta?: boolean
          trabalha_terca?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      patentes: {
        Row: {
          created_at: string
          faturamento_minimo_necessario: number
          icon: string | null
          id: string
          nome_patente: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          faturamento_minimo_necessario?: number
          icon?: string | null
          id?: string
          nome_patente: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          faturamento_minimo_necessario?: number
          icon?: string | null
          id?: string
          nome_patente?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cidade: string | null
          created_at: string
          current_patente_id: string | null
          descricao_salao: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          faturamento_total_acumulado: number
          foto_perfil: string | null
          id: string
          nome_profissional_ou_salao: string
          nome_salao: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          current_patente_id?: string | null
          descricao_salao?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          faturamento_total_acumulado?: number
          foto_perfil?: string | null
          id: string
          nome_profissional_ou_salao?: string
          nome_salao?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cidade?: string | null
          created_at?: string
          current_patente_id?: string | null
          descricao_salao?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          faturamento_total_acumulado?: number
          foto_perfil?: string | null
          id?: string
          nome_profissional_ou_salao?: string
          nome_salao?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_patente_id_fkey"
            columns: ["current_patente_id"]
            isOneToOne: false
            referencedRelation: "patentes"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          card_tax_rate: number
          commission_rate: number
          created_at: string
          gross_profit: number
          id: string
          material_costs: Json | null
          name: string
          profit_margin: number
          sale_price: number
          service_tax_rate: number
          total_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          card_tax_rate?: number
          commission_rate?: number
          created_at?: string
          gross_profit?: number
          id?: string
          material_costs?: Json | null
          name: string
          profit_margin?: number
          sale_price: number
          service_tax_rate?: number
          total_cost?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          card_tax_rate?: number
          commission_rate?: number
          created_at?: string
          gross_profit?: number
          id?: string
          material_costs?: Json | null
          name?: string
          profit_margin?: number
          sale_price?: number
          service_tax_rate?: number
          total_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transacoes_financeiras: {        Row: {
          category: string | null
          commission: number | null
          created_at: string
          date: string
          description: string
          id: string
          is_recurring: boolean | null
          payment_method: string | null
          recurring_frequency: string | null
          servico_id: string | null
          tipo_transacao: Database["public"]["Enums"]["tipo_transacao"]
          updated_at: string
          user_id: string
          valor: number
        }        Insert: {
          category?: string | null
          commission?: number | null
          created_at?: string
          date?: string
          description: string
          id?: string
          is_recurring?: boolean | null
          payment_method?: string | null
          recurring_frequency?: string | null
          servico_id?: string | null
          tipo_transacao: Database["public"]["Enums"]["tipo_transacao"]
          updated_at?: string
          user_id: string
          valor: number
        }        Update: {
          category?: string | null
          commission?: number | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean | null
          payment_method?: string | null
          recurring_frequency?: string | null
          servico_id?: string | null
          tipo_transacao?: Database["public"]["Enums"]["tipo_transacao"]
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_financeiras_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_financial_summary: {
        Args: { 
          p_month: number;
          p_year: number;
          p_user_id?: string;
        }
        Returns: {
          faturamento_bruto: number;
          custos_diretos: number;
          custos_indiretos: number;
          comissoes: number;
          impostos_taxas: number;
          servicos_realizados: number;
          ticket_medio: number;
          resultado_liquido: number;
          margem_lucro: number;
          periodo: {
            mes: number;
            ano: number;
            data_inicio: string;
            data_fim: string;
          };
          percentuais: {
            custos_diretos_pct: number;
            custos_indiretos_pct: number;
            impostos_pct: number;
            comissoes_pct: number;
          };
        }
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      recalculate_user_revenue_and_patentes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_patente: {
        Args: { user_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      tipo_transacao: "ENTRADA" | "SAIDA"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      tipo_transacao: ["ENTRADA", "SAIDA"],
      user_role: ["user", "admin"],
    },
  },
} as const
