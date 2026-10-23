// Fotos de Unsplash (licencia Unsplash: uso libre, se agradece el crédito)
// archivo -> [autor, usuario de Unsplash, id de la foto, id de imagen]
export const PHOTOS = {
  '/img/productos/gorra-rosso.jpg': ['Taehoon Kim', 'duometre_', 'KD0XKtrllU8', '1720682186050-e1d7963cfa1a'],
  '/img/productos/gorra-silver.jpg': ['Ragnar Beaverson', 'ragnarbeaverson', 'V-B_UxwniCU', '1759503407074-2cc8538e6d66'],
  '/img/productos/gorra-papaya.jpg': ['Justin Reichelt', 'justinreichelt', '3yaJMBtCK7k', '1761751237616-df7e2f9211d8'],
  '/img/productos/remera-rosso.jpg': ['MChe Lee', 'mclee', 'lHXxvy4YBPY', '1758499535896-7be3b226d854'],
  '/img/productos/remera-bull.jpg': ['Ahmad Marikar', 'amarivue', 'buGm8fue0sk', '1770432383458-8970b9631afe'],
  '/img/productos/remera-green.jpg': ['Isaac Maffeis', 'isaacmaffeis', 'UU1txX-LtEA', '1699138346782-8a8b211c3da2'],
  '/img/productos/buzo-pitcrew.jpg': ['Marc Kleen', 'marckleen', '8CqwTEGPLmo', '1659203206829-218b9b5930e5'],
  '/img/productos/campera-paddock.jpg': ['Justin Reichelt', 'justinreichelt', '2R8KCcSaqGs', '1761751237853-7489598b7498'],
  '/img/productos/auto-143-rosso.jpg': ['Stefan Cosma', 'stefanbc', '4SQ8AkUX0PU', '1674717397031-3841482f25d1'],
  '/img/productos/auto-118-silver.jpg': ['Philip Myrtorp', 'philipmyr', 'Q305cWY2X3E', '1610019080778-471083eb5965'],
  '/img/productos/casco-mini.jpg': ['Todd Jiang', 'toddjiang', 'jAGMc5EwpZ4', '1770349694206-5d7adcbe9a8b'],
  '/img/productos/taza.jpg': ['Invisible', 'invisiblelity', 'in-s8HhbdcU', '1764901797362-4a8e22b5ef55'],
  '/img/productos/llavero-volante.jpg': ['Sushrut Koche', 'sushrut__okay', 'S3A_aagnZ4k', '1768370770523-07a42d64209d'],
  '/img/productos/bandera.jpg': ['chris robert', 'chris_robert', '65oNjZMX5NY', '1689974288558-c393a05cb59e'],
  '/img/hero.jpg': ['Veerender Mothukuri', 'veerender_mothukuri', 'iToMHOihS2A', '1763514354318-4dc78884b26c'],
  '/img/categorias/gorras.jpg': ['jacopo marello', 'jacmar', 'Ign7jHTf93I', '1519589863-f02030e7127e'],
  '/img/categorias/remeras.jpg': ['Taehoon Kim', 'duometre_', 'vjuw3i0pxpA', '1720423755262-61786842f2b8'],
  '/img/categorias/buzos.jpg': ['Talon-Kai Honeyman', 'seenbytk', 'nHe6PEGvwto', '1774487671647-613e738aa000'],
  '/img/categorias/coleccionables.jpg': ['Ahmed Sellami', 'ahmedsellami', '45MVf7km3Cc', '1625052254979-e46830d798fc'],
  '/img/categorias/accesorios.jpg': ['Simon Hurry', 'bullterriere', 'PlqAUtpY9Vk', '1633292176821-17e236396274'],
};

export const CATEGORY_PHOTOS = {
  Gorras: '/img/categorias/gorras.jpg',
  Remeras: '/img/categorias/remeras.jpg',
  'Buzos y camperas': '/img/categorias/buzos.jpg',
  Coleccionables: '/img/categorias/coleccionables.jpg',
  Accesorios: '/img/categorias/accesorios.jpg',
};

export const isPhoto = (imagen) => typeof imagen === 'string' && (imagen.startsWith('/') || imagen.startsWith('http'));
