export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      lessons: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          content: string
          track: 'beginner' | 'intermediate' | 'advanced' | 'projects'
          order_index: number
          estimated_time: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          content: string
          track: 'beginner' | 'intermediate' | 'advanced' | 'projects'
          order_index?: number
          estimated_time?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          content?: string
          track?: 'beginner' | 'intermediate' | 'advanced' | 'projects'
          order_index?: number
          estimated_time?: number
          created_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          lesson_id: string
          title: string
          description: string
          starter_code: string
          solution: string
          test_cases: Json
          hints: Json
          order_index: number
          difficulty: 'easy' | 'medium' | 'hard'
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description: string
          starter_code?: string
          solution: string
          test_cases?: Json
          hints?: Json
          order_index?: number
          difficulty?: 'easy' | 'medium' | 'hard'
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          description?: string
          starter_code?: string
          solution?: string
          test_cases?: Json
          hints?: Json
          order_index?: number
          difficulty?: 'easy' | 'medium' | 'hard'
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          last_accessed: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          last_accessed?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          last_accessed?: string
          created_at?: string
        }
      }
      exercise_attempts: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          code: string
          passed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          code: string
          passed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          code?: string
          passed?: boolean
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          icon: string
          requirement_type: string
          requirement_value: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon: string
          requirement_type: string
          requirement_value: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string
          requirement_type?: string
          requirement_value?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
    }
  }
}

export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type UserProgress = Database['public']['Tables']['user_progress']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
