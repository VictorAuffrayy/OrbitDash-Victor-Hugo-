const BASE = 'https://www.themealdb.com/api/json/v1/1'

// Dictionnaire FR → EN pour la recherche
const FR_TO_EN = {
  // Viandes
  'poulet': 'chicken', 'boeuf': 'beef', 'porc': 'pork', 'agneau': 'lamb',
  'canard': 'duck', 'dinde': 'turkey', 'veau': 'veal', 'lapin': 'rabbit',
  // Poissons
  'saumon': 'salmon', 'thon': 'tuna', 'crevettes': 'prawn', 'moules': 'mussels',
  'cabillaud': 'cod', 'sardines': 'sardines', 'truite': 'trout',
  // Pâtes & Riz
  'pates': 'pasta', 'spaghetti': 'spaghetti', 'riz': 'rice', 'risotto': 'risotto',
  'lasagnes': 'lasagna', 'tagliatelles': 'tagliatelle',
  // Légumes
  'tomates': 'tomato', 'champignons': 'mushroom', 'epinards': 'spinach',
  'courgettes': 'zucchini', 'aubergines': 'aubergine', 'poireaux': 'leek',
  // Plats
  'pizza': 'pizza', 'soupe': 'soup', 'curry': 'curry', 'tacos': 'tacos',
  'burger': 'burger', 'salade': 'salad', 'omelette': 'omelette',
  'quiche': 'quiche', 'ratatouille': 'ratatouille', 'crepes': 'crepes',
  // Desserts
  'gateau': 'cake', 'chocolat': 'chocolate', 'tiramisu': 'tiramisu',
  'cheesecake': 'cheesecake', 'brownies': 'brownies', 'cookies': 'cookies',
  'crepes': 'crepes', 'pancakes': 'pancakes', 'tarte': 'tart',
}

// Noms de plats traduits FR
const MEAL_NAME_TRANSLATIONS = {
  'Chicken Tikka Masala': 'Poulet Tikka Masala',
  'Chicken Curry': 'Curry de Poulet',
  'Beef Stroganoff': 'Boeuf Stroganoff',
  'Spaghetti Bolognese': 'Spaghetti Bolognaise',
  'Spaghetti Carbonara': 'Spaghetti Carbonara',
  'Beef Bourguignon': 'Boeuf Bourguignon',
  'Chicken Alfredo': 'Poulet Alfredo',
  'Beef Stew': 'Ragoût de Boeuf',
  'Salmon Filo': 'Saumon en Filo',
  'Honey Teriyaki Salmon': 'Saumon Teriyaki au Miel',
  'Pasta e Fagioli': 'Pâtes aux Haricots',
  'Penne Arrabiata': 'Penne Arrabiata',
  'Pizza Express Margherita': 'Pizza Margherita',
  'French Onion Soup': 'Soupe à l\'Oignon',
  'Chocolate Mousse': 'Mousse au Chocolat',
  'Chocolate Brownies': 'Brownies au Chocolat',
  'Chocolate Gateau': 'Gâteau au Chocolat',
  'Bakewell Tart': 'Tarte Bakewell',
  'Banana Pancakes': 'Pancakes à la Banane',
  'Creamy Tomato Soup': 'Soupe Crémeuse à la Tomate',
  'Lamb Tagine': 'Tajine d\'Agneau',
  'Mushroom Risotto': 'Risotto aux Champignons',
  'Grilled Salmon with Citrus Salsa Verde': 'Saumon Grillé Salsa Verde',
  'Duck Confit': 'Confit de Canard',
  'Ratatouille': 'Ratatouille',
  'Tarte Tatin': 'Tarte Tatin',
  'Coq au Vin': 'Coq au Vin',
  'Beef and Mustard Pie': 'Tourte Boeuf Moutarde',
  'Vegan Lasagna': 'Lasagnes Véganes',
  'Big Mac': 'Big Mac Maison',
  'Pad Thai': 'Pad Thaï',
}

// Catégories traduites
const CATEGORY_TRANSLATIONS = {
  'Beef': 'Boeuf', 'Chicken': 'Poulet', 'Lamb': 'Agneau', 'Pork': 'Porc',
  'Seafood': 'Fruits de mer', 'Pasta': 'Pâtes', 'Vegetarian': 'Végétarien',
  'Vegan': 'Végétalien', 'Dessert': 'Dessert', 'Starter': 'Entrée',
  'Side': 'Accompagnement', 'Breakfast': 'Petit-déjeuner', 'Goat': 'Chèvre',
  'Miscellaneous': 'Divers', 'Soup': 'Soupe',
}

// Zones traduites
const AREA_TRANSLATIONS = {
  'French': 'Française', 'Italian': 'Italienne', 'American': 'Américaine',
  'Mexican': 'Mexicaine', 'Japanese': 'Japonaise', 'Chinese': 'Chinoise',
  'Indian': 'Indienne', 'British': 'Britannique', 'Greek': 'Grecque',
  'Spanish': 'Espagnole', 'Thai': 'Thaïlandaise', 'Moroccan': 'Marocaine',
  'Turkish': 'Turque', 'Vietnamese': 'Vietnamienne', 'Canadian': 'Canadienne',
  'Croatian': 'Croate', 'Dutch': 'Néerlandaise', 'Egyptian': 'Égyptienne',
  'Filipino': 'Philippinoise', 'Irish': 'Irlandaise', 'Jamaican': 'Jamaïcaine',
  'Kenyan': 'Kényane', 'Malaysian': 'Malaisienne', 'Polish': 'Polonaise',
  'Portuguese': 'Portugaise', 'Russian': 'Russe', 'Tunisian': 'Tunisienne',
  'Unknown': 'Inconnue',
}

function translateQuery(query) {
  const lower = query.toLowerCase().trim()
  return FR_TO_EN[lower] || query
}

function translateMeal(meal) {
  if (!meal) return null
  return {
    ...meal,
    strMeal: MEAL_NAME_TRANSLATIONS[meal.strMeal] || meal.strMeal,
    strCategory: CATEGORY_TRANSLATIONS[meal.strCategory] || meal.strCategory,
    strArea: AREA_TRANSLATIONS[meal.strArea] || meal.strArea,
  }
}

function parseMeal(meal) {
  if (!meal) return null
  const translated = translateMeal(meal)
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]
    if (ing && ing.trim()) ingredients.push({ name: ing.trim(), measure: measure?.trim() || '' })
  }

  // Découpe les instructions en étapes propres
  const rawInstructions = meal.strInstructions || ''
  const steps = rawInstructions
    .split(/\r?\n|\.\s+(?=[A-Z])/)
    .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(s => s.length > 15)
    .slice(0, 10)

  return {
    id: meal.idMeal,
    name: translated.strMeal,
    nameOriginal: meal.strMeal,
    category: translated.strCategory,
    area: translated.strArea,
    image: meal.strMealThumb,
    instructions: steps,
    ingredients,
    youtube: meal.strYoutube,
    tags: meal.strTags ? meal.strTags.split(',').map(t => t.trim()).filter(Boolean) : [],
  }
}

export const mealService = {
  search: async (query) => {
    const englishQuery = translateQuery(query)
    const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(englishQuery)}`)
    const data = await res.json()
    return data.meals || []
  },

  getRandom: async () => {
    const res = await fetch(`${BASE}/random.php`)
    const data = await res.json()
    return data.meals?.[0] || null
  },

  getAndParse: async (query) => {
    if (!query || query === 'random') {
      const meal = await mealService.getRandom()
      return parseMeal(meal)
    }
    const meals = await mealService.search(query)
    return parseMeal(meals[0])
  },

  // Liste de suggestions en français avec leur équivalent anglais
  suggestions: [
    { fr: 'poulet', label: '🍗 Poulet' },
    { fr: 'pates', label: '🍝 Pâtes' },
    { fr: 'saumon', label: '🐟 Saumon' },
    { fr: 'boeuf', label: '🥩 Bœuf' },
    { fr: 'curry', label: '🍛 Curry' },
    { fr: 'pizza', label: '🍕 Pizza' },
    { fr: 'soupe', label: '🍲 Soupe' },
    { fr: 'chocolat', label: '🍫 Chocolat' },
    { fr: 'agneau', label: '🐑 Agneau' },
    { fr: 'champignons', label: '🍄 Champignons' },
    { fr: 'crepes', label: '🥞 Crêpes' },
    { fr: 'tacos', label: '🌮 Tacos' },
  ]
}