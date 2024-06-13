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
      postgrespropertydocuments3: {
        Row: {
          apn: string | null
          block: string | null
          booknumber: string | null
          booktype: string | null
          createdat: string | null
          documentdate: string | null
          documentid: string | null
          filingcode: string | null
          grantee: string | null
          grantor: string | null
          id: number
          latitude: number | null
          longitude: number | null
          lot: string | null
          nameinternalid: string | null
          names: string | null
          numberofpages: number | null
          primarydocnumber: string | null
          secondarydocnumber: string | null
          totalnamescount: number | null
          updatedat: string | null
        }
        Insert: {
          apn?: string | null
          block?: string | null
          booknumber?: string | null
          booktype?: string | null
          createdat?: string | null
          documentdate?: string | null
          documentid?: string | null
          filingcode?: string | null
          grantee?: string | null
          grantor?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          lot?: string | null
          nameinternalid?: string | null
          names?: string | null
          numberofpages?: number | null
          primarydocnumber?: string | null
          secondarydocnumber?: string | null
          totalnamescount?: number | null
          updatedat?: string | null
        }
        Update: {
          apn?: string | null
          block?: string | null
          booknumber?: string | null
          booktype?: string | null
          createdat?: string | null
          documentdate?: string | null
          documentid?: string | null
          filingcode?: string | null
          grantee?: string | null
          grantor?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          lot?: string | null
          nameinternalid?: string | null
          names?: string | null
          numberofpages?: number | null
          primarydocnumber?: string | null
          secondarydocnumber?: string | null
          totalnamescount?: number | null
          updatedat?: string | null
        }
        Relationships: []
      }
      propertydocuments2: {
        Row: {
          apn: string | null
          block: string | null
          booknumber: string | null
          booktype: string | null
          createdat: string | null
          documentdate: string | null
          documentid: string | null
          filingcode: string | null
          grantee: string | null
          grantor: string | null
          id: number
          lot: string | null
          nameinternalid: string | null
          names: string | null
          numberofpages: number | null
          primarydocnumber: string | null
          secondarydocnumber: string | null
          totalnamescount: number | null
          updatedat: string | null
        }
        Insert: {
          apn?: string | null
          block?: string | null
          booknumber?: string | null
          booktype?: string | null
          createdat?: string | null
          documentdate?: string | null
          documentid?: string | null
          filingcode?: string | null
          grantee?: string | null
          grantor?: string | null
          id?: number
          lot?: string | null
          nameinternalid?: string | null
          names?: string | null
          numberofpages?: number | null
          primarydocnumber?: string | null
          secondarydocnumber?: string | null
          totalnamescount?: number | null
          updatedat?: string | null
        }
        Update: {
          apn?: string | null
          block?: string | null
          booknumber?: string | null
          booktype?: string | null
          createdat?: string | null
          documentdate?: string | null
          documentid?: string | null
          filingcode?: string | null
          grantee?: string | null
          grantor?: string | null
          id?: number
          lot?: string | null
          nameinternalid?: string | null
          names?: string | null
          numberofpages?: number | null
          primarydocnumber?: string | null
          secondarydocnumber?: string | null
          totalnamescount?: number | null
          updatedat?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
