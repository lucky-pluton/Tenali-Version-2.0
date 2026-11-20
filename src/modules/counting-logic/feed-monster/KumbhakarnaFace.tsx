import React from 'react';

export type KumbhakarnaMood =
  | 'hungry'
  | 'counting'
  | 'ready'
  | 'too_few'
  | 'too_many'
  | 'exact'
  | 'eating';

export interface KumbhakarnaFaceProps {
  mood?: KumbhakarnaMood;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * KumbhakarnaFace
 * SVG Vector Character illustration precisely modeled on the user's reference image:
 * - Royal golden Mukut (crown) with 3 sharp peaks and a central ruby gemstone
 * - Purple skin complexion with chubby giant jowls
 * - Large expressive eyes with bold red irises and reflection dots
 * - Soft purple/magenta orbital eye-socket shading and cheek blush
 * - Thick, angular furrowed demon eyebrows
 * - Bulbous round nose
 * - Dark royal mustache
 * - Downward/expressive mouth with two prominent white demon fangs
 * - Symmetrical purple ears with golden hoop earrings
 * - Purple rounded shoulders with golden neck torque and medallion
 */
export default function KumbhakarnaFace({
  mood = 'hungry',
  size = 220,
  className = '',
  style = {}
}: KumbhakarnaFaceProps) {
  return (
    <div
      className={`kumbhakarna-face-root ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        maxWidth: '100%',
        ...style
      }}
    >
      <svg
        viewBox="0 0 320 320"
        width="100%"
        height="100%"
        style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 16px rgba(44, 26, 59, 0.35))' }}
      >
        <defs>
          {/* Skin & Body Gradient */}
          <linearGradient id="kbSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8764a8" />
            <stop offset="60%" stopColor="#78589e" />
            <stop offset="100%" stopColor="#674688" />
          </linearGradient>

          {/* Shoulders Gradient */}
          <linearGradient id="kbShouldersGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78589e" />
            <stop offset="100%" stopColor="#553573" />
          </linearGradient>

          {/* Crown Gold Gradient */}
          <linearGradient id="kbCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8ab4d" />
            <stop offset="45%" stopColor="#cca044" />
            <stop offset="85%" stopColor="#b48938" />
            <stop offset="100%" stopColor="#9a7128" />
          </linearGradient>

          {/* Crown Peaks Shadow Gradient */}
          <linearGradient id="kbCrownPeaksGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4a548" />
            <stop offset="50%" stopColor="#b98d39" />
            <stop offset="100%" stopColor="#9c7229" />
          </linearGradient>

          {/* Ruby Gem Gradient */}
          <radialGradient id="kbRubyGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="35%" stopColor="#dc2626" />
            <stop offset="75%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#580f0f" />
          </radialGradient>

          {/* Earring Gold Gradient */}
          <linearGradient id="kbEarringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>

          {/* Red Iris Gradient */}
          <radialGradient id="kbIrisGrad" cx="40%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="50%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#881337" />
          </radialGradient>

          {/* Tear Drop Gradient for 'too_few' */}
          <linearGradient id="kbTearGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="60%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        {/* ============================================================== */}
        {/* 1. BROAD SHOULDERS & BACKGROUND BODY                           */}
        {/* ============================================================== */}
        <g id="kb-shoulders">
          <path
            d="M 28 320 C 30 250 80 230 160 230 C 240 230 290 250 292 320 Z"
            fill="url(#kbShouldersGrad)"
            stroke="#2c1a3b"
            strokeWidth="4"
          />

          {/* Left & Right Collar Bone accents */}
          <path
            d="M 68 290 Q 110 270 140 282"
            fill="none"
            stroke="#452461"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 252 290 Q 210 270 180 282"
            fill="none"
            stroke="#452461"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Golden Neck Collar / Torque */}
          <path
            d="M 80 250 Q 160 290 240 250"
            fill="none"
            stroke="#cca044"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 80 250 Q 160 290 240 250"
            fill="none"
            stroke="#2c1a3b"
            strokeWidth="11"
            strokeLinecap="round"
            style={{ zIndex: -1 }}
          />
          {/* Re-draw golden inner stroke to create crisp borders */}
          <path
            d="M 80 250 Q 160 290 240 250"
            fill="none"
            stroke="#cca044"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Center Medallion on Necklace */}
          <circle
            cx="160"
            cy="276"
            r="13"
            fill="#cca044"
            stroke="#2c1a3b"
            strokeWidth="3.5"
          />
          <circle
            cx="160"
            cy="276"
            r="9"
            fill="#d4a548"
          />
          <circle
            cx="157"
            cy="273"
            r="3"
            fill="#fef08a"
            opacity="0.85"
          />
        </g>

        {/* ============================================================== */}
        {/* 2. EARS & GOLDEN HOOP EARRINGS                                 */}
        {/* ============================================================== */}
        <g id="kb-ears">
          {/* Left Ear */}
          <path
            d="M 84 146 C 42 144 38 214 84 214 Z"
            fill="#78589e"
            stroke="#2c1a3b"
            strokeWidth="4"
          />
          <path
            d="M 68 166 C 54 176 58 196 74 196"
            fill="none"
            stroke="#4d306b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Left Golden Hoop Earring ("C" ring hanging at earlobe) */}
          <g transform="translate(56, 204)">
            <path
              d="M 8 -10 C -4 -10 -6 14 8 14"
              fill="none"
              stroke="#2c1a3b"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M 8 -10 C -4 -10 -6 14 8 14"
              fill="none"
              stroke="url(#kbEarringGrad)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Inner highlight sparkle */}
            <circle cx="0" cy="2" r="1.5" fill="#ffffff" />
          </g>

          {/* Right Ear */}
          <path
            d="M 236 146 C 278 144 282 214 236 214 Z"
            fill="#78589e"
            stroke="#2c1a3b"
            strokeWidth="4"
          />
          <path
            d="M 252 166 C 266 176 262 196 246 196"
            fill="none"
            stroke="#4d306b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Right Golden Hoop Earring ("C" ring hanging at earlobe) */}
          <g transform="translate(264, 204)">
            <path
              d="M -8 -10 C 4 -10 6 14 -8 14"
              fill="none"
              stroke="#2c1a3b"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M -8 -10 C 4 -10 6 14 -8 14"
              fill="none"
              stroke="url(#kbEarringGrad)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Inner highlight sparkle */}
            <circle cx="0" cy="2" r="1.5" fill="#ffffff" />
          </g>
        </g>

        {/* ============================================================== */}
        {/* 3. GIANT ROUND HEAD & CHEEKS                                   */}
        {/* ============================================================== */}
        <g id="kb-head">
          {/* Giant Oval/Squircle Head */}
          <ellipse
            cx="160"
            cy="180"
            rx="96"
            ry="88"
            fill="url(#kbSkinGrad)"
            stroke="#2c1a3b"
            strokeWidth="4"
          />

          {/* Orbital / Eye Socket Shading (Distinct Dark Purple Shadow from reference) */}
          <circle
            cx="112"
            cy="154"
            r="35"
            fill="#56336c"
            opacity="0.45"
          />
          <circle
            cx="208"
            cy="154"
            r="35"
            fill="#56336c"
            opacity="0.45"
          />

          {/* Soft Cheek Blush Spots on both lower cheeks */}
          <ellipse
            cx="92"
            cy="194"
            rx="20"
            ry="12"
            fill="#56336c"
            opacity={mood === 'ready' || mood === 'exact' ? 0.8 : 0.55}
          />
          <ellipse
            cx="228"
            cy="194"
            rx="20"
            ry="12"
            fill="#56336c"
            opacity={mood === 'ready' || mood === 'exact' ? 0.8 : 0.55}
          />

          {/* Extra Puffed-up Cheeks for 'too_many' */}
          {mood === 'too_many' && (
            <>
              <ellipse cx="76" cy="190" rx="14" ry="18" fill="#a855f7" opacity="0.3" />
              <ellipse cx="244" cy="190" rx="14" ry="18" fill="#a855f7" opacity="0.3" />
            </>
          )}
        </g>

        {/* ============================================================== */}
        {/* 4. ROYAL GOLDEN CROWN (MUKUT)                                  */}
        {/* ============================================================== */}
        <g id="kb-crown">
          {/* Crown Peaks (3 prominent peaks from reference: Center high, 2 sides) */}
          <polygon
            points="62,106 60,62 116,92 160,28 204,92 260,62 258,106"
            fill="url(#kbCrownPeaksGrad)"
            stroke="#2c1a3b"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Inner 3D facets/creases on Crown peaks */}
          <polyline
            points="60,62 116,92 160,28 204,92 260,62"
            fill="none"
            stroke="#eab308"
            strokeWidth="2"
            opacity="0.65"
          />
          <line
            x1="160"
            y1="28"
            x2="160"
            y2="106"
            stroke="#854d0e"
            strokeWidth="2"
            opacity="0.4"
          />

          {/* Crown Base Horizontal Band across Forehead */}
          <rect
            x="60"
            y="104"
            width="200"
            height="26"
            rx="2"
            fill="url(#kbCrownGrad)"
            stroke="#2c1a3b"
            strokeWidth="4"
          />
          {/* Highlight ridge line on Crown band */}
          <line
            x1="64"
            y1="108"
            x2="256"
            y2="108"
            stroke="#fef08a"
            strokeWidth="2"
            opacity="0.75"
          />
          <line
            x1="64"
            y1="126"
            x2="256"
            y2="126"
            stroke="#78350f"
            strokeWidth="1.5"
            opacity="0.5"
          />

          {/* Center Ruby Gemstone with Golden Outer Ring */}
          <circle
            cx="160"
            cy="117"
            r="15"
            fill="#cca044"
            stroke="#2c1a3b"
            strokeWidth="3.5"
          />
          <circle
            cx="160"
            cy="117"
            r="12"
            fill="url(#kbRubyGrad)"
            stroke="#7f1d1d"
            strokeWidth="1.5"
          />
          {/* Ruby Gem shine dot */}
          <ellipse
            cx="156"
            cy="113"
            rx="3.5"
            ry="2"
            fill="#ffffff"
            opacity="0.85"
            transform="rotate(-25 156 113)"
          />

          {/* Sparkles on Crown when mood is exact */}
          {mood === 'exact' && (
            <g className="anim-pop">
              <path
                d="M 160 10 L 163 20 L 173 23 L 163 26 L 160 36 L 157 26 L 147 23 L 157 20 Z"
                fill="#fde047"
              />
              <path
                d="M 120 70 L 122 75 L 127 77 L 122 79 L 120 84 L 118 79 L 113 77 L 118 75 Z"
                fill="#fde047"
              />
              <path
                d="M 200 70 L 202 75 L 207 77 L 202 79 L 200 84 L 198 79 L 193 77 L 198 75 Z"
                fill="#fde047"
              />
            </g>
          )}
        </g>

        {/* ============================================================== */}
        {/* 5. EYES & EXPRESSIONS                                          */}
        {/* ============================================================== */}
        <g id="kb-eyes">
          {/* LEFT EYE */}
          {mood === 'exact' || mood === 'eating' ? (
            // Joyful Happy Crescent Eyes (^ ^)
            <path
              d="M 94 162 C 102 144 126 144 134 162"
              fill="none"
              stroke="#2c1a3b"
              strokeWidth="5"
              strokeLinecap="round"
            />
          ) : mood === 'too_many' ? (
            // Dizzy Swirl Left Eye
            <g transform="translate(114, 154)">
              <circle cx="0" cy="0" r="22" fill="#ffffff" stroke="#2c1a3b" strokeWidth="3.5" />
              <path
                d="M 0 0 C 4 -6 10 -4 8 2 C 6 8 -4 8 -6 0 C -8 -8 6 -12 10 -4"
                fill="none"
                stroke="#b91c1c"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          ) : (
            // Regular/Reference Red Almond Eye
            <g id="kb-left-eye-normal">
              {/* Sclera (White) */}
              <path
                d="M 90 155 C 92 135 136 135 138 155 C 138 175 92 175 90 155 Z"
                fill="#ffffff"
                stroke="#2c1a3b"
                strokeWidth="3.5"
              />
              {/* Bold Red Iris */}
              <ellipse
                cx={mood === 'counting' ? 116 : 118}
                cy={mood === 'counting' ? 160 : 155}
                rx="12.5"
                ry="13.5"
                fill="url(#kbIrisGrad)"
                stroke="#7f1d1d"
                strokeWidth="1"
              />
              {/* Pupil Core */}
              <circle
                cx={mood === 'counting' ? 116 : 118}
                cy={mood === 'counting' ? 160 : 155}
                r="6"
                fill="#450a0a"
              />
              {/* Crisp White Highlight Reflection (Top-Left 10 o'clock) */}
              <circle
                cx={mood === 'counting' ? 113 : 114}
                cy={mood === 'counting' ? 156 : 150}
                r="3.5"
                fill="#ffffff"
              />
              {mood === 'ready' && (
                <circle cx="121" cy="158" r="1.8" fill="#ffffff" />
              )}
            </g>
          )}

          {/* RIGHT EYE */}
          {mood === 'exact' || mood === 'eating' ? (
            // Joyful Happy Crescent Eyes (^ ^)
            <path
              d="M 186 162 C 194 144 218 144 226 162"
              fill="none"
              stroke="#2c1a3b"
              strokeWidth="5"
              strokeLinecap="round"
            />
          ) : mood === 'too_many' ? (
            // Dizzy Swirl Right Eye
            <g transform="translate(206, 154)">
              <circle cx="0" cy="0" r="22" fill="#ffffff" stroke="#2c1a3b" strokeWidth="3.5" />
              <path
                d="M 0 0 C -4 -6 -10 -4 -8 2 C -6 8 4 8 6 0 C 8 -8 -6 -12 -10 -4"
                fill="none"
                stroke="#b91c1c"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          ) : (
            // Regular/Reference Red Almond Eye
            <g id="kb-right-eye-normal">
              {/* Sclera (White) */}
              <path
                d="M 182 155 C 184 135 228 135 230 155 C 230 175 184 175 182 155 Z"
                fill="#ffffff"
                stroke="#2c1a3b"
                strokeWidth="3.5"
              />
              {/* Bold Red Iris */}
              <ellipse
                cx={mood === 'counting' ? 204 : 202}
                cy={mood === 'counting' ? 160 : 155}
                rx="12.5"
                ry="13.5"
                fill="url(#kbIrisGrad)"
                stroke="#7f1d1d"
                strokeWidth="1"
              />
              {/* Pupil Core */}
              <circle
                cx={mood === 'counting' ? 204 : 202}
                cy={mood === 'counting' ? 160 : 155}
                r="6"
                fill="#450a0a"
              />
              {/* Crisp White Highlight Reflection (Top-Left 10 o'clock) */}
              <circle
                cx={mood === 'counting' ? 200 : 198}
                cy={mood === 'counting' ? 156 : 150}
                r="3.5"
                fill="#ffffff"
              />
              {mood === 'ready' && (
                <circle cx="205" cy="158" r="1.8" fill="#ffffff" />
              )}
            </g>
          )}

          {/* Sad Tear Drop for 'too_few' */}
          {mood === 'too_few' && (
            <path
              d="M 98 178 C 94 186 90 196 98 196 C 104 196 102 186 98 178 Z"
              fill="url(#kbTearGrad)"
              stroke="#1e3a8a"
              strokeWidth="1.5"
            />
          )}
        </g>

        {/* ============================================================== */}
        {/* 6. EYEBROWS                                                    */}
        {/* ============================================================== */}
        <g id="kb-eyebrows">
          {mood === 'too_few' ? (
            // Sad pleading eyebrows (center tilted up)
            <>
              <path
                d="M 90 148 L 134 136"
                stroke="#2c1a3b"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path
                d="M 230 148 L 186 136"
                stroke="#2c1a3b"
                strokeWidth="9"
                strokeLinecap="round"
              />
            </>
          ) : mood === 'exact' || mood === 'eating' ? (
            // Cheerful raised arched eyebrows
            <>
              <path
                d="M 90 134 Q 112 120 136 134"
                fill="none"
                stroke="#2c1a3b"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 184 134 Q 208 120 230 134"
                fill="none"
                stroke="#2c1a3b"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </>
          ) : mood === 'ready' ? (
            // Excited arched eyebrows
            <>
              <path
                d="M 88 132 Q 114 122 138 138"
                fill="none"
                stroke="#2c1a3b"
                strokeWidth="8.5"
                strokeLinecap="round"
              />
              <path
                d="M 232 132 Q 206 122 182 138"
                fill="none"
                stroke="#2c1a3b"
                strokeWidth="8.5"
                strokeLinecap="round"
              />
            </>
          ) : (
            // Iconic Furrowed Slanted Eyebrows (from Reference Image)
            <>
              {/* Left Eyebrow: Slanted down towards nose */}
              <polygon
                points="88,136 138,152 136,160 86,144"
                fill="#2c1a3b"
              />
              {/* Right Eyebrow: Slanted down towards nose */}
              <polygon
                points="232,136 182,152 184,160 234,144"
                fill="#2c1a3b"
              />
            </>
          )}
        </g>

        {/* ============================================================== */}
        {/* 7. BULBOUS ROUND BUTTON NOSE                                   */}
        {/* ============================================================== */}
        <g id="kb-nose">
          <ellipse
            cx="160"
            cy="180"
            rx="20"
            ry="16"
            fill="#694689"
            stroke="#2c1a3b"
            strokeWidth="3.5"
          />
          {/* Subtle upper light highlight */}
          <ellipse
            cx="158"
            cy="174"
            rx="9"
            ry="4"
            fill="#8e6aa8"
            opacity="0.6"
          />
        </g>

        {/* ============================================================== */}
        {/* 8. ROYAL DARK MUSTACHE                                         */}
        {/* ============================================================== */}
        <g id="kb-mustache">
          {/* Two smooth curved wings meeting under the nose */}
          <path
            d="M 160 198 
               C 142 190 120 192 110 202 
               C 126 215 148 212 160 205 
               C 172 212 194 215 210 202 
               C 200 192 178 190 160 198 Z"
            fill="#2c1a3b"
            stroke="#1d1127"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* ============================================================== */}
        {/* 9. MOUTH & WHITE DEMON FANGS                                   */}
        {/* ============================================================== */}
        <g id="kb-mouth">
          {mood === 'exact' ? (
            // Big open happy laughing smile showing tongue and fangs!
            <g id="kb-mouth-happy">
              {/* Open smile cavity */}
              <path
                d="M 126 218 Q 160 216 194 218 C 194 246 126 246 126 218 Z"
                fill="#581c87"
                stroke="#2c1a3b"
                strokeWidth="3.5"
              />
              {/* Pink tongue */}
              <path
                d="M 140 236 Q 160 224 180 236 C 174 245 146 245 140 236 Z"
                fill="#f43f5e"
              />
              {/* Left Fang */}
              <polygon
                points="132,218 142,218 137,232"
                fill="#ffffff"
                stroke="#2c1a3b"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Right Fang */}
              <polygon
                points="178,218 188,218 183,232"
                fill="#ffffff"
                stroke="#2c1a3b"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </g>
          ) : mood === 'eating' ? (
            // Chewing / smacking lips with tongue out
            <g id="kb-mouth-eating">
              <ellipse cx="160" cy="226" rx="18" ry="10" fill="#581c87" stroke="#2c1a3b" strokeWidth="3" />
              <circle cx="160" cy="228" r="7" fill="#f43f5e" />
              {/* Left & Right Fangs */}
              <polygon points="144,222 150,222 147,231" fill="#ffffff" stroke="#2c1a3b" strokeWidth="1.5" />
              <polygon points="170,222 176,222 173,231" fill="#ffffff" stroke="#2c1a3b" strokeWidth="1.5" />
            </g>
          ) : mood === 'too_many' ? (
            // Wavy / squiggly overwhelmed mouth
            <g id="kb-mouth-too-many">
              <path
                d="M 128 226 Q 142 220 152 228 Q 162 236 176 226 Q 186 222 192 226"
                fill="none"
                stroke="#2c1a3b"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Drooping Fangs */}
              <polygon points="138,225 146,224 142,236" fill="#ffffff" stroke="#2c1a3b" strokeWidth="2" />
              <polygon points="174,225 182,224 178,236" fill="#ffffff" stroke="#2c1a3b" strokeWidth="2" />
            </g>
          ) : mood === 'ready' ? (
            // Happy expectant grin
            <g id="kb-mouth-ready">
              <path
                d="M 128 220 Q 160 236 192 220"
                fill="none"
                stroke="#2c1a3b"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <polygon points="136,221 144,222 140,234" fill="#ffffff" stroke="#2c1a3b" strokeWidth="2" />
              <polygon points="176,222 184,221 180,234" fill="#ffffff" stroke="#2c1a3b" strokeWidth="2" />
            </g>
          ) : (
            // Iconic Reference Downward Mouth with White Fangs
            <g id="kb-mouth-reference">
              {/* Downward curved mouth line */}
              <path
                d="M 126 228 Q 160 218 194 228"
                fill="none"
                stroke="#2c1a3b"
                strokeWidth="4.5"
                strokeLinecap="round"
              />

              {/* Left Fang: White triangle pointing down */}
              <polygon
                points="134,224 145,222 139,238"
                fill="#ffffff"
                stroke="#2c1a3b"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Right Fang: White triangle pointing down */}
              <polygon
                points="175,222 186,224 181,238"
                fill="#ffffff"
                stroke="#2c1a3b"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
