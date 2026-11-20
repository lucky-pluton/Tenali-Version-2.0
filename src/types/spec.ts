/**
 * OpenSpec v1.0 Types for Educational Game Specifications
 */

export interface OpenSpecLevel {
  level: number;
  name: string;
  description: string;
  range?: string;
  [key: string]: any;
}

export interface OpenSpec {
  $schema?: string;
  specVersion?: string;
  id: string;
  name: string;
  domain: string;
  competencyCode?: string;
  competency: string;
  targetAge: string;
  ncertStandard?: string;
  overview: string;
  learningOutcomes: string[];
  levels: OpenSpecLevel[];
  stateMachine: string[];
  [key: string]: any;
}
