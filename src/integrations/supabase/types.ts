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
      atividades: {
        Row: {
          conteudo: string
          created_at: string
          data_criacao: string
          disciplina: string | null
          id: string
          serie: string | null
          template_usado: string | null
          tipo_material: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          conteudo: string
          created_at: string
          data_criacao: string
          disciplina: string | null
          id: string
          serie: string | null
          template_usado: string | null
          tipo_material: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          classroom: string | null
          created_at: string
          description: string | null
          end_date: string
          end_time: string
          event_type: string
          grade: string | null
          id: string
          material_id: string | null
          material_ids: string | null
          recurrence: Json | null
          start_date: string
          start_time: string
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          classroom?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          end_time: string
          event_type?: string
          grade?: string | null
          id?: string
          material_id?: string | null
          material_ids?: string | null
          recurrence?: Json | null
          start_date: string
          start_time: string
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          classroom?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          end_time?: string
          event_type?: string
          grade?: string | null
          id?: string
          material_id?: string | null
          material_ids?: string | null
          recurrence?: Json | null
          start_date?: string
          start_time?: string
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      perfis: {
        Row: {
          anos_serie: string[] | null
          celular: string | null
          created_at: string | null
          disciplinas: string[] | null
          etapas_ensino: string[] | null
          id: string
          nome_preferido: string | null
          preferencia_bncc: boolean | null
          tipo_material_favorito: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          anos_serie?: string[] | null
          celular?: string | null
          created_at?: string | null
          disciplinas?: string[] | null
          etapas_ensino?: string[] | null
          id?: string
          nome_preferido?: string | null
          preferencia_bncc?: boolean | null
          tipo_material_favorito?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          anos_serie?: string[] | null
          celular?: string | null
          created_at?: string | null
          disciplinas?: string[] | null
          etapas_ensino?: string[] | null
          id?: string
          nome_preferido?: string | null
          preferencia_bncc?: boolean | null
          tipo_material_favorito?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      planos_de_aula: {
        Row: {
          conteudo: string
          created_at: string
          data_criacao: string
          disciplina: string | null
          id: string
          serie: string | null
          template_usado: string | null
          tipo_material: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      planos_usuarios: {
        Row: {
          created_at: string
          data_expiracao: string | null
          data_inicio: string
          id: string
          plano_ativo: Database["public"]["Enums"]["tipo_plano"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_expiracao?: string | null
          data_inicio?: string
          id?: string
          plano_ativo?: Database["public"]["Enums"]["tipo_plano"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_expiracao?: string | null
          data_inicio?: string
          id?: string
          plano_ativo?: Database["public"]["Enums"]["tipo_plano"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      slides: {
        Row: {
          conteudo: string
          created_at: string
          data_criacao: string
          disciplina: string | null
          id: string
          serie: string | null
          template_usado: string | null
          tipo_material: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      uso_mensal_materiais: {
        Row: {
          ano: number
          created_at: string
          id: string
          materiais_criados: number
          mes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ano: number
          created_at?: string
          id?: string
          materiais_criados?: number
          mes: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: number
          created_at?: string
          id?: string
          materiais_criados?: number
          mes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_material: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      get_plan_limits: {
        Args: { plan_type: Database["public"]["Enums"]["tipo_plano"] }
        Returns: number
      }
      increment_material_usage: {
        Args: { p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      tipo_plano: "gratuito" | "professor" | "grupo_escolar"
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
      tipo_plano: ["gratuito", "professor", "grupo_escolar"],
    },
  },
} as const
