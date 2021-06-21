import { data } from "../data";
import {
  component,
  connectStore,
  createStore,
  defineProp,
  eventListener,
  setProp,
} from "./core";

createStore((state, action) => {
  switch (action.type) {
    case "FILTER":
      return { ...state, data: action.payload };
    default:
      return state;
  }
}, data);

function createFilterWidget(handleSelectors) {
  component(
    `filter-widget`,
    connectStore((storeData) => ({
      columns: storeData.getState().columns,
      ...handleSelectors(storeData),
    })),
    eventListener("#container-filter", "click", ({ event, dataElem }) =>
      dataElem.filter({ event, dataElem })
    )
  )(({ columns }) => {
    if (!columns) return `<div>NONE</div>`;
    return `
        <div id="container-filter">
            ${columns.map(
              (dataElem) =>
                `<input data-type="${dataElem.code}" type="checkbox">${dataElem.label}</input>`
            )}
        </div>`;
  });
}

function createVisualWidget(name, excludeColumns, template) {
  component(
    `visual-widget-${name}`,
    connectStore(({ getState }) => ({ data: getState().data }))
  )(({ data }) => {
    if (!data) return `<div>NONE</div>`;
    return template(data);
  });
}

createFilterWidget(({ dispatch }) => ({
  filter: ({ event }) => {
    dispatch({ type: "FILTER", payload: [1, 2, 3, 4] });
  },
}));

createVisualWidget(
  "test",
  (data) => `${data.map((dataElem) => `<div>${dataElem}</div>`)}`
);

const visualWidget = (data, template) =>
  component(
    "visual-widget",
    defineProp("data"),
    setProp("data", data)
  )(({ data }) => {
    if (!data) return `<div>NONE</div>`;
    return template(data);
  });

visualWidget(
  data.data,
  (data) => `${data.map((dataElem) => `<div>${dataElem}</div>`)}`
);
