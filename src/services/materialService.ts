// ... (código anterior mantido)

    export const parseContentGenerate = (content: string, type: string): any => {
      try {
        const parsedContent = JSON.parse(content);
        
        if (type === 'plano-de-aula') {
          // Corrigindo o parsing dos recursos para cada etapa
          if (parsedContent.desenvolvimento && Array.isArray(parsedContent.desenvolvimento)) {
            parsedContent.desenvolvimento = parsedContent.desenvolvimento.map((etapa: any) => {
              // Garantindo que os recursos sejam um array e estejam corretamente associados
              if (etapa.recursos && typeof etapa.recursos === 'string') {
                etapa.recursos = etapa.recursos
                  .split(',')
                  .map((r: string) => r.trim())
                  .filter((r: string) => r.length > 0);
              } else if (!etapa.recursos) {
                etapa.recursos = [];
              }
              return etapa;
            });
          }
        }
        
        return parsedContent;
      } catch (error) {
        console.error('Error parsing content:', error);
        return {};
      }
    };

    // ... (restante do código mantido)
