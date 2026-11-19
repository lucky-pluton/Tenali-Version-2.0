import React from 'react';
import { X, Code, CheckCircle, BookOpen, Layers } from 'lucide-react';

export default function OpenSpecModal({ spec, onClose }) {
  if (!spec) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div className="anim-pop" style={{
        background: 'var(--clr-card)',
        border: '1px solid var(--clr-accent)',
        borderRadius: 'var(--radius)',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 22px',
          borderBottom: '1px solid var(--clr-border)',
          background: 'var(--clr-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'var(--clr-accent-soft)',
              color: 'var(--clr-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              <Code size={15} />
              <span>OPENSPEC v{spec.specVersion || '1.0.0'}</span>
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              margin: 0,
              color: 'var(--clr-text)'
            }}>
              {spec.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              background: 'var(--clr-input)',
              color: 'var(--clr-text-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{
          padding: '22px',
          overflowY: 'auto',
          fontSize: '0.92rem',
          color: 'var(--clr-text)',
          lineHeight: 1.6
        }}>
          {/* Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ background: 'var(--clr-surface)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase' }}>Module ID</span>
              <div style={{ fontWeight: 700, color: 'var(--clr-accent)', fontFamily: 'monospace' }}>{spec.id}</div>
            </div>
            <div style={{ background: 'var(--clr-surface)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase' }}>Pedagogy Domain</span>
              <div style={{ fontWeight: 700, color: 'var(--clr-text)' }}>{spec.domain}</div>
            </div>
            <div style={{ background: 'var(--clr-surface)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase' }}>FLN Competency Code</span>
              <div style={{ fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>{spec.competencyCode}</div>
            </div>
            <div style={{ background: 'var(--clr-surface)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase' }}>Target Age Group</span>
              <div style={{ fontWeight: 700, color: 'var(--clr-text)' }}>{spec.targetAge}</div>
            </div>
          </div>

          {/* Description & Overview */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ color: 'var(--clr-accent)', marginBottom: '4px', fontSize: '1rem', fontWeight: 700 }}>
              Curriculum Overview & Pedagogical Objective
            </h4>
            <p style={{ color: 'var(--clr-text-soft)', margin: 0 }}>
              {spec.overview}
            </p>
          </div>

          {/* Learning Outcomes */}
          {spec.learningOutcomes && (
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ color: 'var(--clr-accent)', marginBottom: '8px', fontSize: '1rem', fontWeight: 700 }}>
                Target Learning Outcomes (FLN Standards)
              </h4>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {spec.learningOutcomes.map((lo, i) => (
                  <li key={i} style={{ marginBottom: '4px', color: 'var(--clr-text)' }}>{lo}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Level Progression Schema */}
          {spec.levels && (
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ color: 'var(--clr-accent)', marginBottom: '8px', fontSize: '1rem', fontWeight: 700 }}>
                Level Progression Schema
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {spec.levels.map((lvl, i) => (
                  <div key={i} style={{
                    background: 'var(--clr-surface)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div>
                      <strong style={{ color: 'var(--clr-text)' }}>Level {lvl.level}: {lvl.name}</strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>{lvl.description}</div>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      whiteSpace: 'nowrap'
                    }}>
                      Range: {lvl.range}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* State Machine */}
          {spec.stateMachine && (
            <div>
              <h4 style={{ color: 'var(--clr-accent)', marginBottom: '6px', fontSize: '1rem', fontWeight: 700 }}>
                State Machine Transitions
              </h4>
              <div style={{
                background: 'var(--clr-input)',
                border: '1px solid var(--clr-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                color: '#38bdf8'
              }}>
                {spec.stateMachine.join(' ➔ ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
