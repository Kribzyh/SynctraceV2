import './PageBanner.css'; 

export function PageBanner({ icon, tag, title, subtitle, rightElement }) {
  return (
    <div className="page-banner">
      {/* Background Effects */}
      <div className="page-banner__glow-yellow" />
      <div className="page-banner__glow-blue" />

      {/* Main Content */}
      <div className="page-banner__content">
        
        <div className="page-banner__left">
          {icon && (
            <div className="page-banner__icon">
              {icon}
            </div>
          )}
          
          <div>
            {tag && (
              <div className="page-banner__tag">
                <div className="page-banner__tag-dot" />
                <span className="page-banner__tag-text">{tag}</span>
              </div>
            )}
            <h1 className="page-banner__title">{title}</h1>
            <div className="page-banner__subtitle-wrapper">
              <div className="page-banner__subtitle-line" />
              <p className="page-banner__subtitle-text">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Right Section: Actions / Badges */}
        {rightElement && (
          <div className="page-banner__right">
            {rightElement}
          </div>
        )}
        
      </div>
    </div>
  );
}