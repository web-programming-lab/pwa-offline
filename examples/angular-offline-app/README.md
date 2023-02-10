# Offline App in Angular

Wie stelle ich die statischen Assets einer Angular Web App offline zu verfügung?

1. Angular Web App erstellen: `npx ng new angular-offline-app`
1. Angular PWA Package hinzufügen: `npx ng add @angular/pwa`
1. Angular Web App bauen: `npx ng build`
1. Angular dist ausliefern via http-server: `npx http-server -p 8080 -c-0 dist/angular-offline-app`
