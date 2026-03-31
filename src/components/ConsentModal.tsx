import React, { useRef, useState, useEffect } from 'react'
import { X, Check, Trash2, Download, FileSignature } from 'lucide-react'
import Modal from './Modal'

interface ConsentModalProps {
    isOpen: boolean
    onClose: () => void
    petName: string
    ownerName: string
    onSave: (signatureDataUrl: string, type: string) => void
}

const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose, petName, ownerName, onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [consentType, setConsentType] = useState('Cirugía / Anestesia')
    const [hasSignature, setHasSignature] = useState(false)

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.strokeStyle = '#0d2b2b'
                ctx.lineWidth = 3
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
            }
        }
    }, [isOpen])

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true)
        draw(e)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        if (canvasRef.current) {
            // Check if canvas is not empty (simplified check)
            setHasSignature(true)
        }
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY

        if (isDrawing) {
            ctx.lineTo(x, y)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(x, y)
        }
    }

    const clear = () => {
        if (!canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        setHasSignature(false)
    }

    const handleSave = () => {
        if (!canvasRef.current || !hasSignature) return
        onSave(canvasRef.current.toDataURL(), consentType)
        clear()
    }

    const consentTemplates: Record<string, string> = {
        'Cirugía / Anestesia': `Yo, ${ownerName}, autorizo la realización del procedimiento quirúrgico y anestésico para mi mascota ${petName}. He sido informado de los riesgos y beneficios.`,
        'Eutanasia': `Yo, ${ownerName}, solicito y autorizo la práctica de la eutanasia humanitaria para mi mascota ${petName} debido a su estado de salud irreversible.`,
        'Hospitalización': `Yo, ${ownerName}, autorizo la hospitalización y tratamiento médico necesario para mi mascota ${petName}. me comprometo a cubrir los costos asociados.`,
        'General': `Autorización general para examen físico y procedimientos menores para ${petName}.`
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Firmar Consentimiento Digital">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Tipo de Consentimiento</label>
                    <select 
                        className="input-premium" 
                        value={consentType} 
                        onChange={e => setConsentType(e.target.value)}
                        style={{ marginTop: '8px' }}
                    >
                        {Object.keys(consentTemplates).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
                    <p>{consentTemplates[consentType]}</p>
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px', color: '#94a3b8', fontSize: '12px' }}>
                        Estás firmando digitalmente este documento el {new Date().toLocaleDateString('es')}.
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        Firma del Propietario (Dibuje abajo)
                        <button onClick={clear} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Trash2 size={12} /> Limpiar
                        </button>
                    </label>
                    <canvas
                        ref={canvasRef}
                        width={500}
                        height={180}
                        onMouseDown={startDrawing}
                        onMouseUp={stopDrawing}
                        onMouseMove={draw}
                        onMouseOut={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchEnd={stopDrawing}
                        onTouchMove={draw}
                        style={{
                            width: '100%',
                            height: '180px',
                            background: 'white',
                            border: '2px dashed #cbd5e1',
                            borderRadius: '16px',
                            cursor: 'crosshair',
                            touchAction: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', fontWeight: '600' }}>Cancelar</button>
                    <button 
                        onClick={handleSave} 
                        disabled={!hasSignature}
                        className="btn-premium" 
                        style={{ flex: 2, justifyContent: 'center', opacity: hasSignature ? 1 : 0.5 }}
                    >
                        <Check size={18} /> Confirmar y Guardar
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default ConsentModal
