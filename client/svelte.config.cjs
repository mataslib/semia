// Sets up preprocessor which allows to use other languages in svelte
// like typescript, sass, ...
// Consult https://github.com/sveltejs/svelte-preprocess
// for more information about preprocessors
const sveltePreprocess = require('svelte-preprocess')

module.exports = {
  preprocess: sveltePreprocess()
}
