import fs from 'node:fs'

const file=new URL('../src/data/recipes.json',import.meta.url)
const data=JSON.parse(fs.readFileSync(file,'utf8'))
const i=(name,quantity,unit,preparation='',shopping=true)=>({name,quantity,unit,preparation,shopping,groceryItemId:name.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')})

const ingredients={
 'pulled-pork':[i('Pork Shoulder',5,'kg','boneless'),i('Salt',5,'tbsp','kosher'),i('Black Pepper',3,'tbsp','coarsely ground'),i('Paprika',3,'tbsp','sweet'),i('Brown Sugar',0.5,'cup','packed'),i('Garlic Powder',2,'tbsp'),i('Apple Cider Vinegar',2,'cup','for spritz'),i('Apple Juice',2,'cup','for spritz')],
 'smoked-brisket':[i('Beef Brisket',7,'kg','whole packer, trimmed'),i('Salt',0.5,'cup','kosher'),i('Black Pepper',0.5,'cup','coarsely ground'),i('Garlic Powder',3,'tbsp'),i('Beef Tallow',250,'g'),i('Butcher Paper',1,'package','pink, unwaxed')],
 'smoked-ribs':[i('Pork Ribs',6,'rack','spare ribs'),i('BBQ Dry Rub',1.5,'cup'),i('Butter',340,'g','cut into pats'),i('Honey',1,'cup'),i('Apple Juice',3,'cup'),i('BBQ Sauce',3,'cup','gluten-free')],
 'greek-chicken-skewers':[i('Chicken Thighs',3,'kg','boneless and skinless; cubed'),i('Olive Oil',0.5,'cup'),i('Lemon Juice',1,'cup','freshly squeezed'),i('Garlic',12,'clove','minced'),i('Oregano',0.33,'cup','dried'),i('Salt',4,'tsp'),i('Black Pepper',2,'tsp')],
 'greek-beef-skewers':[i('Beef Sirloin',2.5,'kg','top sirloin; cubed'),i('Bell Pepper',5,'each','mixed colours; cubed'),i('Red Onion',3,'each','cubed'),i('Olive Oil',0.5,'cup'),i('Lemon Juice',0.5,'cup','freshly squeezed'),i('Red Wine Vinegar',0.33,'cup'),i('Garlic',8,'clove','minced'),i('Oregano',3,'tbsp','dried'),i('Paprika',1,'tbsp','sweet'),i('Salt',3,'tsp'),i('Black Pepper',2,'tsp')],
 'tzatziki':[i('Greek Yogurt',1.5,'kg','full-fat'),i('Cucumber',3,'each','English; grated and drained'),i('Garlic',5,'clove','minced'),i('Dill',1,'bunch','chopped'),i('Lemon Juice',0.33,'cup'),i('Olive Oil',0.25,'cup'),i('Salt',2,'tsp')],
 'greek-salad':[i('Tomato',12,'each','cut into wedges'),i('Cucumber',4,'each','English; sliced'),i('Red Onion',2,'each','thinly sliced'),i('Kalamata Olives',3,'cup','drained'),i('Feta Cheese',1.2,'kg','cut into slabs'),i('Bell Pepper',4,'each','green; sliced'),i('Olive Oil',1,'cup'),i('Red Wine Vinegar',0.33,'cup'),i('Oregano',2,'tbsp','dried'),i('Salt',2,'tsp')],
 'roasted-potatoes':[i('Potatoes',4,'kg','Yukon Gold; cut into chunks'),i('Olive Oil',1,'cup'),i('Salt',1.5,'tbsp'),i('Black Pepper',2,'tsp')],
 'caesar-salad':[i('Romaine Lettuce',8,'heart','washed, dried and chopped'),i('Garlic',3,'clove','minced'),i('Anchovy Paste',1.5,'tsp'),i('Lemon Juice',3,'tbsp'),i('Dijon Mustard',1.5,'tsp'),i('Worcestershire Sauce',1.5,'tsp','gluten-free'),i('Mayonnaise',1.5,'cup'),i('Parmesan Cheese',0.75,'cup','finely grated for dressing'),i('Parmesan Cheese',2.25,'cup','shaved for serving'),i('Salt',0.25,'tsp'),i('Black Pepper',0.25,'tsp'),i('Croutons',3,'package','regular'),i('Gluten-Free Croutons',1,'package','for Steve and Adele')],
 'coleslaw':[i('Green Cabbage',2,'head','shredded'),i('Red Cabbage',1,'head','shredded'),i('Carrots',8,'each','shredded'),i('Mayonnaise',2.5,'cup'),i('Apple Cider Vinegar',0.5,'cup'),i('Sugar',0.33,'cup'),i('Celery Seed',2,'tsp'),i('Salt',2,'tsp'),i('Black Pepper',1,'tsp')],
 'mimis-potato-salad':[i('Potatoes',5,'kg','yellow; cubed'),i('Eggs',8,'each','hard-boiled'),i('Celery',6,'stalk','diced'),i('Red Onion',2,'each','diced'),i('Dill Pickles',3,'cup','diced'),i('Mayonnaise',3,'cup'),i('Mustard',0.5,'cup','yellow'),i('Pickle Juice',0.5,'cup'),i('Paprika',2,'tsp'),i('Salt',1,'tbsp'),i('Black Pepper',2,'tsp')],
 'mac-and-cheese':[i('Pasta',2,'kg','elbow macaroni'),i('Butter',340,'g'),i('Flour',1.5,'cup'),i('Milk',3,'L'),i('Cheddar Cheese',1.2,'kg','shredded'),i('Gruyere Cheese',600,'g','shredded'),i('Fontina Cheese',500,'g','shredded'),i('Parmesan Cheese',300,'g','grated'),i('Dijon Mustard',3,'tbsp'),i('Panko Breadcrumbs',3,'cup'),i('Salt',1,'tbsp'),i('Black Pepper',2,'tsp')],
 'bbq-chicken':[i('Chicken Pieces',5,'kg','bone-in thighs and drumsticks'),i('BBQ Dry Rub',1.25,'cup'),i('Olive Oil',0.5,'cup'),i('BBQ Sauce',3,'cup','gluten-free')],
 'sous-vide-filet':[i('Beef Tenderloin',17,'each','170–225 g centre-cut filets'),i('Salt',5,'tsp'),i('Black Pepper',3,'tsp'),i('Butter',340,'g'),i('Garlic',12,'clove','crushed'),i('Thyme',2,'bunch','fresh'),i('Rosemary',1,'bunch','fresh')],
 'whole-lobster':[i('Lobster',10,'each','live Maritime lobster; 680–900 g each'),i('Salt',0.5,'cup','for steaming water'),i('Butter',680,'g','melted for serving'),i('Lemon',6,'each','cut into wedges')],
 'strawberry-shortcake':[i('Strawberries',3,'kg','hulled and sliced'),i('Sugar',1.25,'cup','divided'),i('Buttermilk Biscuits',18,'each'),i('Cream',1.5,'L','35% whipping cream'),i('Vanilla Extract',2,'tbsp'),i('Icing Sugar',0.5,'cup')],
 'brownies':[i('Dark Chocolate',300,'g','chopped'),i('Butter',340,'g'),i('Sugar',3,'cup'),i('Eggs',4,'each'),i('Vanilla Extract',2,'tsp'),i('Flour',1.5,'cup'),i('Cocoa Powder',0.75,'cup'),i('Salt',1,'tsp','flaky')],
 'guacamole':[i('Avocado',10,'each','ripe'),i('Lime',5,'each','juiced'),i('Red Onion',1,'each','finely diced'),i('Jalapeno',2,'each','seeded and minced'),i('Cilantro',1,'bunch','chopped'),i('Tomato',4,'each','Roma; seeded and diced'),i('Salt',2,'tsp')],
 'taco-chicken':[i('Chicken Thighs',3,'kg','boneless and skinless'),i('Cumin',2,'tbsp','ground'),i('Chili Powder',2,'tbsp'),i('Paprika',1,'tbsp'),i('Garlic Powder',1,'tbsp'),i('Onion Powder',1,'tbsp'),i('Oregano',2,'tsp','dried'),i('Lime',4,'each','juiced'),i('Salt',1,'tbsp')],
 'taco-beef':[i('Ground Beef',3,'kg'),i('Yellow Onion',3,'each','diced'),i('Garlic',8,'clove','minced'),i('Chili Powder',3,'tbsp'),i('Cumin',2,'tbsp','ground'),i('Paprika',1,'tbsp'),i('Oregano',2,'tsp','dried'),i('Tomato Paste',2,'can','156 mL each'),i('Beef Broth',3,'cup','gluten-free'),i('Salt',1,'tbsp')],
 'pressed-italian-sandwiches':[i('Italian Bread',4,'each','large ciabatta loaves'),i('Salami',750,'g','thinly sliced'),i('Prosciutto',500,'g','thinly sliced'),i('Soppressata',500,'g','thinly sliced'),i('Provolone Cheese',900,'g','sliced'),i('Roasted Red Peppers',2,'jar','500 mL each; drained'),i('Olive Salad',1,'jar','500 mL muffuletta spread'),i('Italian Dressing',1,'cup'),i('Gluten-Free Rolls',1,'package','for Steve and Adele')],
 'broccoli-salad':[i('Broccoli',8,'head','crowns; chopped small'),i('Bacon',500,'g','cooked and crumbled'),i('Cheddar Cheese',500,'g','cubed or shredded'),i('Red Onion',2,'each','finely diced'),i('Sunflower Seeds',1.5,'cup'),i('Mayonnaise',2,'cup'),i('Apple Cider Vinegar',0.33,'cup'),i('Sugar',0.33,'cup'),i('Salt',1,'tsp'),i('Black Pepper',0.5,'tsp')],
 'garlic-mussels':[i('Mussels',4,'kg','fresh; scrubbed and debearded'),i('Butter',250,'g'),i('Garlic',2,'head','minced'),i('White Wine',750,'mL','dry'),i('Parsley',2,'bunch','chopped'),i('Lemon',2,'each','cut into wedges'),i('Salt',2,'tsp'),i('Black Pepper',1,'tsp')],
 'shrimp-cocktail':[i('Shrimp',2.5,'kg','cooked and peeled'),i('Cocktail Sauce',2,'bottle','gluten-free; 455 mL each'),i('Lemon',4,'each','cut into wedges'),i('Ice',2,'bag','for serving')],
 'charcuterie-board':[i('Italian Meats',2,'kg','assorted'),i('Cheese',2,'kg','assorted'),i('Olives',3,'jar','assorted'),i('Dill Pickles',2,'jar'),i('Grapes',2,'kg'),i('Berries',1,'kg','assorted'),i('Crackers',3,'box'),i('Gluten-Free Crackers',2,'box'),i('Mustard',2,'jar','assorted'),i('Preserves',2,'jar','assorted')]
}

for(const recipe of data.recipes){
 if(!ingredients[recipe.id])throw new Error(`Missing structured ingredients for ${recipe.id}`)
 recipe.ingredients=ingredients[recipe.id]
}

fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n')
console.log(`Structured ${data.recipes.length} recipes with ${data.recipes.reduce((sum,r)=>sum+r.ingredients.length,0)} ingredients.`)
