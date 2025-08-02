export function CriticalCSS() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Critical CSS for above-the-fold content */
          *,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
          ::before,::after{--tw-content:''}
          html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;min-width:360px}
          body{margin:0;line-height:inherit}
          h1{font-size:inherit;font-weight:inherit;margin:0}
          p{margin:0}
          a{color:inherit;text-decoration:inherit}
          button{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0;background-color:transparent;background-image:none;border:0}
          ul{list-style:none;margin:0;padding:0}
          img,svg{display:block;vertical-align:middle;max-width:100%;height:auto}
          .antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
          .max-w-2xl{max-width:42rem}
          .mb-40{margin-bottom:10rem}
          .flex{display:flex}
          .flex-col{flex-direction:column}
          .mx-4{margin-left:1rem;margin-right:1rem}
          .mt-8{margin-top:2rem}
          .flex-auto{flex:1 1 auto}
          .min-w-0{min-width:0}
          .mt-6{margin-top:1.5rem}
          .px-2{padding-left:.5rem;padding-right:.5rem}
          .font-medium{font-weight:500}
          .text-2xl{font-size:1.5rem;line-height:2rem}
          .mb-8{margin-bottom:2rem}
          .tracking-tighter{letter-spacing:-.05em}
          @media (min-width:768px){
            .md\\:flex-row{flex-direction:row}
            .md\\:px-0{padding-left:0;padding-right:0}
          }
          @media (min-width:1024px){
            .lg\\:mx-auto{margin-left:auto;margin-right:auto}
          }
          :root{color-scheme:light dark}
          @media (prefers-color-scheme:dark){
            .dark\\:text-white{color:#ffffff}
            .dark\\:bg-\\[\\#111010\\]{background-color:#111010}
          }
          .text-black{color:#000000}
          .bg-white{background-color:#ffffff}
        `,
      }}
    />
  );
}