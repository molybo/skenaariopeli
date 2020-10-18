var boardbuilder = function() {

  const SHARED_NAMED_WIDGETS = "NamedWidgets";

  const FRAME_WIDTH = 1350;
  const FRAME_HEIGHT = 1080;

  const FRAME_PADDING = 25;
  const FRAME_MARGIN = 50;

  const FRAME_4_WIDTH = 2000;

  const LOWER_PANEL_ANCHOR_Y = 0.22;

  var NamedWidgets = {};
  var WidgetsModified = false;

  const box = (x=0,y=0, w=0,h=0, padding=0) => {
    const setPadding = (v) => padding = v;
    const outerX = (anchor) => w*anchor+x;
    const outerY = (anchor) => h*anchor+y;
    const innerX = (anchor) => (w-2*padding)*anchor+x+padding;
    const innerY = (anchor) => (h-2*padding)*anchor+y+padding;
    const innerWidth = (anchor=1) => (w-2*padding)*anchor;
    const innerHeight = (anchor=1) => (h-2*padding)*anchor;
    const centerBox = () => [outerX(0.5), outerY(0.5), w, h];
    return {
      setPadding,
      innerX,
      innerY,
      outerX,
      outerY,
      innerWidth,
      innerHeight,
      centerBox,
    }
  }

  const boundingBox = (x0,y0,x1,y1) => box(x0, y0, x1-x0, y1-y0);

  async function build() {
    WidgetsModified = false;

    let j = await mirotools.getSharedValue(SHARED_NAMED_WIDGETS);
    console.log(j);
    if (j) NamedWidgets = await JSON.parse(j);
    console.log(NamedWidgets);

    let boxFrame0 = box(0,0, FRAME_WIDTH,FRAME_HEIGHT, FRAME_PADDING);
    let boxFrame1 = box((FRAME_WIDTH+FRAME_MARGIN)*1,0, FRAME_WIDTH,FRAME_HEIGHT, FRAME_PADDING);
    let boxFrame2 = box((FRAME_WIDTH+FRAME_MARGIN)*2,0, FRAME_WIDTH,FRAME_HEIGHT, FRAME_PADDING);
    let boxFrame3 = box((FRAME_WIDTH+FRAME_MARGIN)*3,0, FRAME_WIDTH,FRAME_HEIGHT, FRAME_PADDING);
    let boxFrame4 = box((FRAME_WIDTH+FRAME_MARGIN)*4,0, FRAME_4_WIDTH,FRAME_HEIGHT, FRAME_PADDING);

    if (!await verifyWidget("Frame0")) {
      addWidget("Frame0", await createFrame(...boxFrame0.centerBox(), "Pelaajien nimet"));
    }

    if (!await verifyWidget("Frame1")) {
      let boxTitle = boundingBox(
        boxFrame1.innerX(0.00), boxFrame1.innerY(0),
        boxFrame1.innerX(1.00), boxFrame1.innerY(LOWER_PANEL_ANCHOR_Y)
      );
      let boxFrame1a = boundingBox(
        boxFrame1.innerX(0.00), boxFrame1.innerY(LOWER_PANEL_ANCHOR_Y),
        boxFrame1.innerX(0.33), boxFrame1.innerY(1)
      );
      let boxFrame1b = boundingBox(
        boxFrame1.innerX(0.33), boxFrame1.innerY(LOWER_PANEL_ANCHOR_Y),
        boxFrame1.innerX(0.67), boxFrame1.innerY(1)
      );
      let boxFrame1c = boundingBox(
        boxFrame1.innerX(0.67), boxFrame1.innerY(LOWER_PANEL_ANCHOR_Y),
        boxFrame1.innerX(1.00), boxFrame1.innerY(1)
      );
      addWidget("Frame1", await createFrame(...boxFrame1.centerBox(), "1. Me ja skenaarion luonne"));
      await createBoxShape(...boxTitle.centerBox(), "<p><strong>1/6 Me ja skenaarion luonne</strong></p><p>Näkökulmamme tulevaisuuden tarkasteluun</p>", 36);

      await createBoxShape(...boxFrame1a.centerBox(), "SCENARIO_ACTOR_CONTAINER", 24, "#ffffff");
      await createBoxShape(...boxFrame1b.centerBox(), "SCENARIO_YEAR_CONTAINER", 24, "#ffffff");
      await createBoxShape(...boxFrame1c.centerBox(), "SCENARIO_STYLE_CONTAINER", 24, "#ffffff");
      await createBoxShape(...boxFrame1a.centerBox(), "Me (1 kortti)", 24, "#000000");
      await createBoxShape(...boxFrame1b.centerBox(), "Vuosi (1 kortti)", 24, "#000000");
      await createBoxShape(...boxFrame1c.centerBox(), "Skenaarion luonne (1-2 korttia)", 24, "#000000");
      await createLine(boxFrame1a.outerX(1), boxFrame1a.outerY(0), boxFrame1a.outerX(1), boxFrame1a.outerY(1));
      await createLine(boxFrame1b.outerX(1), boxFrame1b.outerY(0), boxFrame1b.outerX(1), boxFrame1b.outerY(1));
    }
    
    if (!await verifyWidget("Frame2")) {
      addWidget("Frame2", await createFrame(...boxFrame2.centerBox(), "2. Tulevaisuuden maailma"));
    }

    if (!await verifyWidget("DealButton")) {
      addWidget("DealButton", await createSticker(boxFrame2.innerX(0.5), boxFrame2.innerY(0.25), "Jaa Ilmiökortti", "#ff9d48"));
    }

    if (!await verifyWidget("Frame3")) {
      addWidget("Frame3", await createFrame(...boxFrame3.centerBox(), "3. Me vuonna 20xx"));
    }

    if (!await verifyWidget("Frame4")) {
      addWidget("Frame4", await createFrame(...boxFrame4.centerBox(), "4. Miten tähän päädyttiin?"));
    }

    if (WidgetsModified) {
      await mirotools.setSharedValue(SHARED_NAMED_WIDGETS, JSON.stringify(NamedWidgets));
    }

    skenaariopeli.setNamedWidgets(NamedWidgets);
  }

  async function verifyWidget(widgetName) {
    if (NamedWidgets[widgetName]) {
      let widget = (await miro.board.widgets.get({ id: NamedWidgets[widgetName] }))[0];
      if (widget) {
        console.log(`Found ${widgetName}`)
        return true;
      }
    }
    console.log(`Not found ${widgetName}`)
    return false;
  }

  function addWidget(widgetName, w) {
    NamedWidgets[widgetName] = w;
    WidgetsModified = true;
  }

  async function createFrame(x, y, w, h, title) {
    let createdWidgets = await miro.board.widgets.create([{
      "type": "FRAME",
      "x": x,
      "y": y,
      "width": w,
      "height": h,
      "style": {
        "backgroundColor": "#ffffff"
      },
      "title": title
    }]);
    return createdWidgets[0].id;
  }

  async function createSticker(x, y, text, color="#f5d128") {
    let createdWidgets = await miro.board.widgets.create([{
      "type": "STICKER",
      "style": {
        "stickerBackgroundColor": color,
        "stickerType": 0
      },
      "x": x,
      "y": y,
      "scale": 1,
      "text": text,
    }]);
    return createdWidgets[0].id;
  }

  async function createBoxShape(x, y, w, h, text, fontSize=24, textColor = "#000000", vAlign="t", align="l") {
    let createdWidgets = await miro.board.widgets.create([{
      "type": "SHAPE",
      "style": {
        "shapeType": 3,
        "backgroundColor": "transparent",
        "backgroundOpacity": 1,
        "borderColor": "transparent",
        "borderWidth": 2,
        "borderOpacity": 1,
        "borderStyle": 2,
        "fontFamily": 10,
        "textColor": textColor,
        "textAlign": align, // l|c|r
        "textAlignVertical": vAlign, // t|m|b
        "fontSize": fontSize,
        "bold": 0,
        "italic": 0,
        "underline": 0,
        "strike": 0,
        "highlighting": ""
      },
      "clientVisible": true,
      "x": x,
      "y": y,
      "width": w,
      "height": h,
      "text": text,
    }]);
    return createdWidgets[0].id;
  }

  async function createLine(x0, y0, x1, y1) {
    /*
    let createdWidgets = await miro.board.widgets.create([{
      "type": "LINE",
      "style": {
        "lineColor": "#000000",
        "lineStyle": 4,
        "lineThickness": 1,
        "lineType": 0,
        "lineStartStyle": 0,
        "lineEndStyle": 0
      },
      "startPosition": {
        "x": x0,
        "y": y0,
      },
      "endPosition": {
        "x": x1,
        "y": y1,
      },
    }]);
    */
    let createdWidgets = await miro.board.widgets.create([{
      "type": "SHAPE",
      "style": {
        "shapeType": 3,
        "backgroundColor": "#e6e6e6",
        "backgroundOpacity": 1,
        "borderColor": "transparent",
        "borderWidth": 1,
        "borderOpacity": 1,
        "borderStyle": 4,
        "fontFamily": 10,
        "textColor": "#e6e6e6",
        "textAlign": "c",
        "textAlignVertical": "m",
        "fontSize": 27,
        "bold": 0,
        "italic": 0,
        "underline": 0,
        "strike": 0,
        "highlighting": ""
      },
      "clientVisible": true,
      "x": x0,
      "y": (y0+y1)*0.5,
      "width": 0,
      "height": (y1-y0),
    }]);

    return createdWidgets[0].id;
  }

  return {
    build
  }
}();
