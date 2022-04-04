---
label: Slate Methods
icon: star
order: 80
---

Programatically control the slate with the below methods.

### add

||| adds a node to the slate

```
    slate.nodes.add({
       new Slatebox.node({
          id: 'first_node',
          name: 'first_node',
          text: 'drag me',
          xPos: 25110,
          yPos: 25120,
          height: 60,
          width: 120,
          vectorPath: 'roundedrectangle',
          backgroundColor: '#24A8E0',
          lineColor: '#333',
          lineWidth: 5,
          allowMenu: true,
          filters: {
            vect: 'dropShadow',
          },
        })
    });
```

||| arguments

| Name     | Type     | Description                             |
| -------- | -------- | --------------------------------------- |
| ~`node`~ | ~object~ | ~[a node object](./node-properties.md)~ |

|||

### addRange

||| add an array of nodes to the slate

```
    slate.nodes.add([{
        new Slatebox.node({
          id: 'first_node',
          name: 'first_node',
          text: 'drag me',
          xPos: 25110,
          yPos: 25120,
          height: 60,
          width: 120,
          vectorPath: 'roundedrectangle',
          backgroundColor: '#24A8E0',
          lineColor: '#333',
          lineWidth: 5,
          allowMenu: true,
          filters: {
            vect: 'dropShadow',
          },
        }),
        new Slatebox.node({
          id: 'second_node',
          name: 'second_node',
          text: 'drag me 2',
          xPos: 25210,
          yPos: 25120,
          height: 60,
          width: 120,
          vectorPath: 'roundedrectangle',
          backgroundColor: '#24A8E0',
          lineColor: '#333',
          lineWidth: 5,
          allowMenu: true,
          filters: {
            vect: 'dropShadow',
          },
        })
    }]);
```

||| arguments

| Name     | Type    | Description                                        |
| -------- | ------- | -------------------------------------------------- |
| ~`node`~ | ~array~ | ~[an array of node objects](./node-properties.md)~ |

|||

### svg

||| download the slate as svg

```
    slate.svg();
```

||| arguments

None

|||

### png

||| download the slate as png

```
    slate.png();
```

||| arguments

None

|||

### zoom

||| zoom the slate

```
slate.canvas.zoom({
  dur: 500,
  callbacks: {
      after: () => {
        console.log('called at the end of the zoom');
    },
    during: () => {
      console.log('called once per animationFrame while zooming');
    }
  },
  easing: 'easeFromTo',
  zoomPercent: 100,
})
```

||| arguments

| Name          | Type      | Description                               |
| ------------- | --------- | ----------------------------------------- |
| ~`dur`~       | ~integer~ | ~duration in millis~                      |
| ~`callbacks`~ | ~object~  | ~callbacks for `after` and `during` move~ |
| ~`easing`~    | ~string~  | ~[see all easing options](./easing.md)~   |

|||

### move

||| move the slate

```
slate.canvas.move({
    x: 125,
    y: 40,
    dur: 500,
    callbacks: {
      after: () => {
        console.log('called at the end of the move');
      },
      during: () => {
        console.log('called once per animationFrame while moving');
      }
    },
    isAbsolute: false,
    easing: 'easeFromTo',
  })
```

||| arguments

| Name           | Type      | Description                                                                      |
| -------------- | --------- | -------------------------------------------------------------------------------- |
| ~`x`~          | ~integer~ | ~`x` in px to move the canvas (relative or absolute, depending on `isAbsolute`)~ |
| ~`y`~          | ~integer~ | ~`y` in px to move the canvas (relative or absolute, depending on `isAbsolute`)~ |
| ~`dur`~        | ~integer~ | ~duration in millis~                                                             |
| ~`callbacks`~  | ~object~  | ~callbacks for `after` and `during` move~                                        |
| ~`isAbsolute`~ | ~boolean~ | ~relative or absolute `x,y` coordinates~                                         |
| ~`easing`~     | ~string~  | ~[see all easing options](./easing.md)~                                          |

|||

||| applyTheme

```
slate.applyTheme.move(theme, syncWithTheme)
```

||| arguments

| Name              | Type      | Description                                                                                                                                                         |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~`theme`~         | ~object~  | ~[A theme object](./themeExample.md)~                                                                                                                               |
| ~`syncWithTheme`~ | ~boolean~ | ~Setting to `true` syncs the properties with created children with the theme properties instead of the default (children inheriting properties from their parents.~ |

|||
