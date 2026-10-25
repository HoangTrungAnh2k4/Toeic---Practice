
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "ai_insights": {
                  Row: {
                    "generated_at": string,"id": string,"payload": NonNullable<Json>,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "generated_at"?: string,"id"?: string,"payload": NonNullable<Json>,"user_id": string
                  }
                  Update: {
                    "generated_at"?: string,"id"?: string,"payload"?: NonNullable<Json>,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "ai_insights_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"annotations": {
                  Row: {
                    "at_sec": number | null,"correction": string,"criterion": Database["public"]['Enums']["criterion"],"end_offset": number,"explanation": string,"id": string,"mistake_pattern_id": string | null,"quote": string,"response_id": string,"severity": Database["public"]['Enums']["severity"],"start_offset": number
                  }
                  ComputedFields: never
                  Insert: {
                    "at_sec"?: number | null,"correction": string,"criterion": Database["public"]['Enums']["criterion"],"end_offset": number,"explanation": string,"id"?: string,"mistake_pattern_id"?: string | null,"quote": string,"response_id": string,"severity": Database["public"]['Enums']["severity"],"start_offset": number
                  }
                  Update: {
                    "at_sec"?: number | null,"correction"?: string,"criterion"?: Database["public"]['Enums']["criterion"],"end_offset"?: number,"explanation"?: string,"id"?: string,"mistake_pattern_id"?: string | null,"quote"?: string,"response_id"?: string,"severity"?: Database["public"]['Enums']["severity"],"start_offset"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "annotations_mistake_pattern_id_fkey"
      columns: ["mistake_pattern_id"]
isOneToOne: false
      referencedRelation: "mistake_patterns"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "annotations_response_id_fkey"
      columns: ["response_id"]
isOneToOne: false
      referencedRelation: "responses"
      referencedColumns: ["id"]
    }
                  ]
                },"attempts": {
                  Row: {
                    "ends_at": string | null,"exam_id": string,"feedback_summary": string | null,"id": string,"mode": Database["public"]['Enums']["attempt_mode"],"part_template_id": number | null,"sample_viewed": boolean,"score": number | null,"scored_at": string | null,"scoring_error": string | null,"scoring_started_at": string | null,"started_at": string,"status": Database["public"]['Enums']["attempt_status"],"submitted_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ends_at"?: string | null,"exam_id": string,"feedback_summary"?: string | null,"id"?: string,"mode": Database["public"]['Enums']["attempt_mode"],"part_template_id"?: number | null,"sample_viewed"?: boolean,"score"?: number | null,"scored_at"?: string | null,"scoring_error"?: string | null,"scoring_started_at"?: string | null,"started_at"?: string,"status"?: Database["public"]['Enums']["attempt_status"],"submitted_at"?: string | null,"user_id"?: string
                  }
                  Update: {
                    "ends_at"?: string | null,"exam_id"?: string,"feedback_summary"?: string | null,"id"?: string,"mode"?: Database["public"]['Enums']["attempt_mode"],"part_template_id"?: number | null,"sample_viewed"?: boolean,"score"?: number | null,"scored_at"?: string | null,"scoring_error"?: string | null,"scoring_started_at"?: string | null,"started_at"?: string,"status"?: Database["public"]['Enums']["attempt_status"],"submitted_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "attempts_exam_id_fkey"
      columns: ["exam_id"]
isOneToOne: false
      referencedRelation: "exams"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attempts_part_template_id_fkey"
      columns: ["part_template_id"]
isOneToOne: false
      referencedRelation: "part_templates"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attempts_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"bookmarks": {
                  Row: {
                    "created_at": string,"exam_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"exam_id": string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"exam_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "bookmarks_exam_id_fkey"
      columns: ["exam_id"]
isOneToOne: false
      referencedRelation: "exams"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bookmarks_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"exam_parts": {
                  Row: {
                    "context": string | null,"context_media_path": string | null,"description": string | null,"exam_id": string,"id": string,"part_template_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "context"?: string | null,"context_media_path"?: string | null,"description"?: string | null,"exam_id": string,"id"?: string,"part_template_id": number
                  }
                  Update: {
                    "context"?: string | null,"context_media_path"?: string | null,"description"?: string | null,"exam_id"?: string,"id"?: string,"part_template_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "exam_parts_exam_id_fkey"
      columns: ["exam_id"]
isOneToOne: false
      referencedRelation: "exams"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "exam_parts_part_template_id_fkey"
      columns: ["part_template_id"]
isOneToOne: false
      referencedRelation: "part_templates"
      referencedColumns: ["id"]
    }
                  ]
                },"exams": {
                  Row: {
                    "code": string,"created_at": string,"created_by": string | null,"id": string,"is_verified": boolean,"published_at": string | null,"review_note": string | null,"skill": Database["public"]['Enums']["skill"],"source": Database["public"]['Enums']["exam_source"],"status": Database["public"]['Enums']["exam_status"],"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"is_verified"?: boolean,"published_at"?: string | null,"review_note"?: string | null,"skill": Database["public"]['Enums']["skill"],"source"?: Database["public"]['Enums']["exam_source"],"status"?: Database["public"]['Enums']["exam_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"is_verified"?: boolean,"published_at"?: string | null,"review_note"?: string | null,"skill"?: Database["public"]['Enums']["skill"],"source"?: Database["public"]['Enums']["exam_source"],"status"?: Database["public"]['Enums']["exam_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "exams_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"mistake_patterns": {
                  Row: {
                    "criteria": (Database["public"]['Enums']["criterion"])[],"id": string,"impact": string,"part_template_id": number | null,"remedy": NonNullable<Json>,"severity": Database["public"]['Enums']["severity"],"skill": Database["public"]['Enums']["skill"],"summary": string,"title": string,"why": string
                  }
                  ComputedFields: never
                  Insert: {
                    "criteria"?: (Database["public"]['Enums']["criterion"])[],"id"?: string,"impact": string,"part_template_id"?: number | null,"remedy": NonNullable<Json>,"severity": Database["public"]['Enums']["severity"],"skill": Database["public"]['Enums']["skill"],"summary": string,"title": string,"why": string
                  }
                  Update: {
                    "criteria"?: (Database["public"]['Enums']["criterion"])[],"id"?: string,"impact"?: string,"part_template_id"?: number | null,"remedy"?: NonNullable<Json>,"severity"?: Database["public"]['Enums']["severity"],"skill"?: Database["public"]['Enums']["skill"],"summary"?: string,"title"?: string,"why"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "mistake_patterns_part_template_id_fkey"
      columns: ["part_template_id"]
isOneToOne: false
      referencedRelation: "part_templates"
      referencedColumns: ["id"]
    }
                  ]
                },"part_templates": {
                  Row: {
                    "context_sec": number | null,"id": number,"part_no": number,"prep_sec": number | null,"q_from": number,"q_to": number,"response_sec": (number)[] | null,"section_sec": number | null,"skill": Database["public"]['Enums']["skill"],"task": string
                  }
                  ComputedFields: never
                  Insert: {
                    "context_sec"?: number | null,"id": number,"part_no": number,"prep_sec"?: number | null,"q_from": number,"q_to": number,"response_sec"?: (number)[] | null,"section_sec"?: number | null,"skill": Database["public"]['Enums']["skill"],"task": string
                  }
                  Update: {
                    "context_sec"?: number | null,"id"?: number,"part_no"?: number,"prep_sec"?: number | null,"q_from"?: number,"q_to"?: number,"response_sec"?: (number)[] | null,"section_sec"?: number | null,"skill"?: Database["public"]['Enums']["skill"],"task"?: string
                  }
                  Relationships: [
                    
                  ]
                },"plan_tasks": {
                  Row: {
                    "attempt_id": string | null,"completed_at": string | null,"description": string | null,"duration_min": number,"exam_id": string | null,"goal": string | null,"id": string,"kind": Database["public"]['Enums']["plan_task_kind"],"mistake_pattern_id": string | null,"part_template_id": number | null,"plan_id": string,"scheduled_date": string,"sort_order": number,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_id"?: string | null,"completed_at"?: string | null,"description"?: string | null,"duration_min": number,"exam_id"?: string | null,"goal"?: string | null,"id"?: string,"kind": Database["public"]['Enums']["plan_task_kind"],"mistake_pattern_id"?: string | null,"part_template_id"?: number | null,"plan_id": string,"scheduled_date": string,"sort_order"?: number,"title": string
                  }
                  Update: {
                    "attempt_id"?: string | null,"completed_at"?: string | null,"description"?: string | null,"duration_min"?: number,"exam_id"?: string | null,"goal"?: string | null,"id"?: string,"kind"?: Database["public"]['Enums']["plan_task_kind"],"mistake_pattern_id"?: string | null,"part_template_id"?: number | null,"plan_id"?: string,"scheduled_date"?: string,"sort_order"?: number,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "plan_tasks_attempt_id_fkey"
      columns: ["attempt_id"]
isOneToOne: true
      referencedRelation: "attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "plan_tasks_exam_id_fkey"
      columns: ["exam_id"]
isOneToOne: false
      referencedRelation: "exams"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "plan_tasks_mistake_pattern_id_fkey"
      columns: ["mistake_pattern_id"]
isOneToOne: false
      referencedRelation: "mistake_patterns"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "plan_tasks_part_template_id_fkey"
      columns: ["part_template_id"]
isOneToOne: false
      referencedRelation: "part_templates"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "plan_tasks_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "study_plans"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"exam_date": string | null,"id": string,"preferred_time": string | null,"reminder_enabled": boolean,"role": Database["public"]['Enums']["user_role"],"target_speaking": number | null,"target_writing": number | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"exam_date"?: string | null,"id": string,"preferred_time"?: string | null,"reminder_enabled"?: boolean,"role"?: Database["public"]['Enums']["user_role"],"target_speaking"?: number | null,"target_writing"?: number | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"exam_date"?: string | null,"id"?: string,"preferred_time"?: string | null,"reminder_enabled"?: boolean,"role"?: Database["public"]['Enums']["user_role"],"target_speaking"?: number | null,"target_writing"?: number | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"questions": {
                  Row: {
                    "audio_path": string | null,"exam_part_id": string,"id": string,"image_alt": string | null,"image_path": string | null,"keywords": Json | null,"number": number,"prompt": string | null,"sample_answer": string | null,"stimulus": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "audio_path"?: string | null,"exam_part_id": string,"id"?: string,"image_alt"?: string | null,"image_path"?: string | null,"keywords"?: Json | null,"number": number,"prompt"?: string | null,"sample_answer"?: string | null,"stimulus"?: string | null
                  }
                  Update: {
                    "audio_path"?: string | null,"exam_part_id"?: string,"id"?: string,"image_alt"?: string | null,"image_path"?: string | null,"keywords"?: Json | null,"number"?: number,"prompt"?: string | null,"sample_answer"?: string | null,"stimulus"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "questions_exam_part_id_fkey"
      columns: ["exam_part_id"]
isOneToOne: false
      referencedRelation: "exam_parts"
      referencedColumns: ["id"]
    }
                  ]
                },"responses": {
                  Row: {
                    "attempt_id": string,"audio_path": string | null,"feedback": string | null,"id": string,"max_score": number | null,"metrics": NonNullable<Json>,"question_id": string,"score": number | null,"scoring_model": string | null,"strengths": NonNullable<Json>,"text_answer": string | null,"transcript": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_id": string,"audio_path"?: string | null,"feedback"?: string | null,"id"?: string,"max_score"?: number | null,"metrics"?: NonNullable<Json>,"question_id": string,"score"?: number | null,"scoring_model"?: string | null,"strengths"?: NonNullable<Json>,"text_answer"?: string | null,"transcript"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "attempt_id"?: string,"audio_path"?: string | null,"feedback"?: string | null,"id"?: string,"max_score"?: number | null,"metrics"?: NonNullable<Json>,"question_id"?: string,"score"?: number | null,"scoring_model"?: string | null,"strengths"?: NonNullable<Json>,"text_answer"?: string | null,"transcript"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "responses_attempt_id_fkey"
      columns: ["attempt_id"]
isOneToOne: false
      referencedRelation: "attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "responses_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    }
                  ]
                },"score_levels": {
                  Row: {
                    "level": number,"min_score": number,"skill": Database["public"]['Enums']["skill"]
                  }
                  ComputedFields: never
                  Insert: {
                    "level": number,"min_score": number,"skill": Database["public"]['Enums']["skill"]
                  }
                  Update: {
                    "level"?: number,"min_score"?: number,"skill"?: Database["public"]['Enums']["skill"]
                  }
                  Relationships: [
                    
                  ]
                },"scoring_usage": {
                  Row: {
                    "day": string,"subject": string,"used": number
                  }
                  ComputedFields: never
                  Insert: {
                    "day": string,"subject": string,"used"?: number
                  }
                  Update: {
                    "day"?: string,"subject"?: string,"used"?: number
                  }
                  Relationships: [
                    
                  ]
                },"study_plan_weeks": {
                  Row: {
                    "plan_id": string,"theme": string,"week_no": number
                  }
                  ComputedFields: never
                  Insert: {
                    "plan_id": string,"theme": string,"week_no": number
                  }
                  Update: {
                    "plan_id"?: string,"theme"?: string,"week_no"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "study_plan_weeks_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "study_plans"
      referencedColumns: ["id"]
    }
                  ]
                },"study_plans": {
                  Row: {
                    "ai_rationale": string | null,"created_at": string,"days_per_week": number,"id": string,"minutes_per_day": number,"status": Database["public"]['Enums']["plan_status"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ai_rationale"?: string | null,"created_at"?: string,"days_per_week": number,"id"?: string,"minutes_per_day": number,"status"?: Database["public"]['Enums']["plan_status"],"user_id"?: string
                  }
                  Update: {
                    "ai_rationale"?: string | null,"created_at"?: string,"days_per_week"?: number,"id"?: string,"minutes_per_day"?: number,"status"?: Database["public"]['Enums']["plan_status"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "study_plans_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "exam_stats": {
                  Row: {
                    "attempt_count": number | null,"completion_rate": number | null,"exam_id": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "attempts_exam_id_fkey"
      columns: ["exam_id"]
isOneToOne: false
      referencedRelation: "exams"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "consume_scoring_quota":
{ Args: { "p_limit": number,"p_subject": string }; Returns: boolean
                           },
"create_exam":
{ Args: { "payload": Json }; Returns: string
                           },
"create_study_plan":
{ Args: { "payload": Json }; Returns: string
                           },
"duplicate_exam":
{ Args: { "source_exam_id": string }; Returns: string
                           },
"refund_scoring_quota":
{ Args: { "p_subject": string }; Returns: undefined
                           },
"update_exam":
{ Args: { "payload": Json,"target_exam_id": string }; Returns: undefined
                           }
          }
          Enums: {
            "attempt_mode": "cbt"|"timed"|"guided","attempt_status": "in_progress"|"submitted"|"scoring"|"scored"|"interrupted","criterion": "pronunciation"|"intonation"|"grammar"|"vocabulary"|"cohesion"|"relevance"|"completeness"|"organization"|"support"|"fluency"|"task_response","exam_source": "ets"|"internal","exam_status": "draft"|"review"|"published"|"archived","plan_status": "active"|"archived","plan_task_kind": "speaking"|"writing"|"review"|"mock"|"summary","severity": "high"|"medium"|"low","skill": "speaking"|"writing","user_role": "student"|"admin"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "attempt_mode": ["cbt", "timed", "guided"],"attempt_status": ["in_progress", "submitted", "scoring", "scored", "interrupted"],"criterion": ["pronunciation", "intonation", "grammar", "vocabulary", "cohesion", "relevance", "completeness", "organization", "support", "fluency", "task_response"],"exam_source": ["ets", "internal"],"exam_status": ["draft", "review", "published", "archived"],"plan_status": ["active", "archived"],"plan_task_kind": ["speaking", "writing", "review", "mock", "summary"],"severity": ["high", "medium", "low"],"skill": ["speaking", "writing"],"user_role": ["student", "admin"]
          }
        }
} as const
