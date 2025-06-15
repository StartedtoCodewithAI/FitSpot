<style>{`
  /* FULL-BLEED PATCH */
  html, body, #root,
  .page-wrapper,
  .container,
  section,
  .callToAction,
  footer,
  .modal-content {
    box-sizing: border-box !important;
    overflow-x: hidden !important;
  }
  .page-wrapper,
  .callToAction,
  footer,
  section {
    width: 100vw !important;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem 0 1rem;
    flex: 1;
    width: 100%;
    box-sizing: border-box;
  }
  .callToAction {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  * {
    min-width: 0;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  body {
    font-family: 'Montserrat', Arial, sans-serif;
  }
  .page-wrapper {
    display: flex;
    flex-direction: column;
    background: linear-gradient(120deg, #f8fafc 0%, #e0f2fe 100%);
    width: 100%;
    box-sizing: border-box;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem 0 1rem;
    flex: 1;
    width: 100%;
    box-sizing: border-box;
  }
  .hero {
    display: flex;
    /* Add your specific hero styles here */
  }
  .features {
    padding: 3rem 1rem;
    border-radius: 15px;
    text-align: center;
    width: 100%;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
  }
  .callToAction .center-btn-row {
    width: 100%;
    /* Add your center-btn-row styles here */
  }
  footer {
    border-top: 1px solid #ddd;
    background: #fff;
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
  }
  .modal-content .cta {
    margin: 0.7rem 0;
  }
`}</style>
