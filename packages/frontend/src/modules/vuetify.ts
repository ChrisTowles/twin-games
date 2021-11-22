
// Vuetify
import { createVuetify } from 'vuetify'
import * as directives from 'vuetify/directives'
import * as components from 'vuetify/components'
import { UserModule } from '~/types'

// Styles
// import 'vuetify/styles'

export const install: UserModule = ({ app }) => {
  const vuetify = createVuetify({
    components,
    directives,
    // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
  })

  app.use(vuetify)
}

/**
 * Resolver for Vuetify v3 - https://github.com/antfu/vitesse/issues/85
 *
 * @link https://github.com/vuetifyjs/vuetify
 */
export function VuetifyResolver(): any {
  return (name: string) => {
    if (name.match(/^V[A-Z]/))
      return { importName: name, path: 'vuetify' }
  }
}
