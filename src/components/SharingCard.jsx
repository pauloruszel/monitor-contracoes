import React from 'react'

function SharingCard({
  configured,
  sharedSession,
  syncStatus,
  onStartSharing,
  onCopyLink,
  onEndSharing,
}) {
  return (
    <section className="card sharing-card">
      <div className="card-header">
        <div>
          <h2>Compartilhamento com a doula</h2>
          <p className="support-text compact-text">
            Gere um link de leitura para a doula acompanhar suas marcações em tempo real.
          </p>
        </div>
        <span className={`badge ${sharedSession ? 'badge-live' : 'badge-muted'}`}>
          {sharedSession ? 'Compartilhando' : 'Desligado'}
        </span>
      </div>

      {!configured ? (
        <p className="support-text">
          O Firebase não está disponível no app no momento. Revise a configuração do Realtime Database.
        </p>
      ) : sharedSession ? (
        <>
          <p className="sharing-link-label">Link da doula</p>
          <code className="sharing-link">{sharedSession.shareUrl}</code>
          <p className="support-text">{syncStatus}</p>
          <div className="sharing-actions">
            <button className="button button-secondary" onClick={onCopyLink} type="button">
              Copiar link
            </button>
            <button className="button button-reset" onClick={onEndSharing} type="button">
              Encerrar compartilhamento
            </button>
          </div>
        </>
      ) : (
        <div className="sharing-actions">
          <button className="button button-start" onClick={onStartSharing} type="button">
            Iniciar compartilhamento
          </button>
        </div>
      )}
    </section>
  )
}

export default SharingCard
