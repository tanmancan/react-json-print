// eslint-disable-next-line
import * as React from 'react';
import {
  useState,
  MouseEvent,
  useContext,
  createContext,
  useMemo,
} from 'react';
import './styles.css';

type DataObject = string | boolean | null | number | object | DataObject[];

type DataKey = string | number;

interface ReactJsonPrintProps {
  /**
   * The data to be printed. Can be primitives, objects, or arrays.
   * All values must be valid JSON types and all object keys
   * must be valid JSON type. (ie. `string` not `Symbol`);
   *
   * @default null
   */
  dataObject?: DataObject;
  /**
   * The data to be printed, provided as a valid JSON string.
   * The string will be parsed via `JSON.parse`. If both `dataString` and `dataObject`
   * are provided, the `dataObject` value will be used.
   *
   * @default undefined
   */
  dataString?: string;
  /**
   * Key for current data value
   *
   * @default 'DATA'
   */
  objectKey?: DataKey;
  /**
   * Displays the entire tree in an expanded state.
   * By default all nested nodes in the tree are collapsed.
   *
   * @default undefined
   */
  expanded?: boolean;
  /**
   * Limits how many levels deep to display child nodes.
   * Value of `0` will print all child nodes. Useful for deeply nested data,
   * when you want to limit the number of node displayed.
   *
   * @default 0
   */
  depth?: number;
  /**
   * Current node depth.
   * Internal use only
   *
   * @default undefined
   */
  currentDepth?: number;
  /**
   * Unique key for a rendered list of elements.
   * Internal use only.
   *
   * @default undefined
   */
  dataKey?: string;
};

enum DataType {
  ARRAY = 'array',
  OBJECT = 'object',
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  NULL = 'null',
  UNDEFINED = 'undefined',
}

enum ExpandState {
  OPENED = 'opened',
  CLOSED = 'closed',
}

const TreeContext = createContext({
  maxDepth: 0,
  expandedTreeState: ExpandState.CLOSED,
});

const getData = (props: ReactJsonPrintProps): DataObject => {
  const { dataObject, dataString } = props;
  if (typeof dataObject === 'boolean') return dataObject;
  if (typeof dataObject === 'number') return dataObject;
  if (dataObject) {
    return dataObject;
  }
  if (dataString) {
    try {
      return JSON.parse(dataString);
    } catch (error) {
      return `ERROR: ${error.message}`;
    }
  }
  return null;
};

const getDataType = (data: DataObject): DataType => {
  if (data === null) return DataType.NULL;

  if (
    data !== null
    && data !== undefined
    && !Array.isArray(data)
    && typeof data === 'object'
  ) return DataType.OBJECT;

  if (Array.isArray(data)) return DataType.ARRAY;

  if (typeof data === 'string') return DataType.STRING;

  if (typeof data === 'number') return DataType.NUMBER;

  if (typeof data === 'boolean') return DataType.BOOLEAN;

  return DataType.UNDEFINED;
};

const getDataValue = (data: DataObject, dataType: DataType): DataObject => {
  switch (dataType) {
    case DataType.BOOLEAN: {
      return `${data}`;
    }
    case DataType.NULL: {
      return 'null';
    }
    case DataType.ARRAY: {
      const dataArray = data as Array<DataObject>;
      return `Array[${dataArray.length}]`
    }
    case DataType.OBJECT: {
      const dataObject = data as object;
      const objectLength: number = Object.keys(dataObject).length;
      return objectLength
        ? 'Object'
        : 'Object (empty)';
    }
    case DataType.UNDEFINED: {
      return 'undefined';
    }
    default:
      return data;
  }
}

const getDataList = (
  data: DataObject,
  dataType: DataType,
  currentDepth: number | undefined,
  dataKey: string,
): Array<JSX.Element> | null => {
  const computedCurrentDepth = currentDepth || currentDepth === 0
    ? currentDepth + 1
    : 0;
  switch (dataType) {
    case DataType.OBJECT: {
      const dataObject = data as object;
      return Object.entries(dataObject)
        .map(([key, value]: [DataKey, DataObject]) => {
          const computedKey: string = `${dataKey}-${key}-${computedCurrentDepth}`;
          return (
            <ReactJsonPrint
              key={computedKey}
              dataObject={value}
              objectKey={key}
              currentDepth={computedCurrentDepth}
              dataKey={computedKey}
            />
          )});
    }
    case DataType.ARRAY: {
      const dataArray = data as Array<DataObject>;
      return dataArray.map((value: DataObject, idx: DataKey) => {
        const computedKey: string = `${dataKey}-${idx}-${computedCurrentDepth}`;
        return (
          <ReactJsonPrint
            key={computedKey}
            dataObject={value}
            objectKey={idx}
            currentDepth={computedCurrentDepth}
            dataKey={computedKey}
          />
      )})
    }
    default:
      return null;
  }
}

const ReactJsonPrint: React.FunctionComponent<ReactJsonPrintProps> = (props: ReactJsonPrintProps) => {
  const {
    expanded,
    depth,
    currentDepth,
    dataKey,
    objectKey,
  } = props;

  const { expandedTreeState, maxDepth } = useContext(TreeContext);
  const initExpandedState: ExpandState = expanded || expandedTreeState === ExpandState.OPENED
    ? ExpandState.OPENED
    : ExpandState.CLOSED
  const [expandedState, setExpandedState] = useState(initExpandedState);

  const data: DataObject = getData(props);
  const dataType: DataType = getDataType(data);
  const dataValue: DataObject = getDataValue(data, dataType);

  const computedKey: string = dataKey
    ? `${dataKey}`
    : `${objectKey}`;

  /**
   * Toggles the nested node collapse state.
   *
   * @param e MouseEvent
   */
  const onHandleClick = (e: MouseEvent): void => {
    e.preventDefault();

    const newState: ExpandState = expandedState === ExpandState.OPENED
      ? ExpandState.CLOSED
      : ExpandState.OPENED;

    setExpandedState(newState);
  }

  /**
   * Data type classes
   */
  const dataTypeClass: string = [
    'data__type',
    `data__type--${dataType}`,
    `data__type--${expandedState}`
  ].join(' ');

  /**
   * Wrapper class for top level key. Can contain a handle if there is a list.
   */
  const dataHandleClass: string = dataType === DataType.ARRAY || dataType === DataType.OBJECT
    ? ['data__list-handle', `data__list-handle--${expandedState}`].join(' ')
    : 'data__no-list';

  /**
   * Classes for the data list wrapper
   */
  const dataListItemsClass: string = [
    'data__list-items',
    `data__list-items--${expandedState}`
  ].join(' ');

  /**
   * Dynamically create classes for the data value wrapper
   */
  const dataValueClass = (): string => {
    const dataValueClass = [
      'data__value',
    ];

    if (dataType !== DataType.OBJECT && dataType !== DataType.ARRAY) {
      dataValueClass.push(
        'data__value--primitive',
        `data__value--${dataType}`,
      );
    }

    if (dataType === DataType.ARRAY) {
      dataValueClass.push(
        'data__value--array',
      );
    }

    if (dataType === DataType.OBJECT) {
      dataValueClass.push(
        'data__value--object',
      );
    }

    return dataValueClass.join(' ');
  };

  /**
   * Wraps context provider only around top level nodes.
   * We then pass in global state for depth and expanded to all child nodes.
   */
  const TopLevelList: JSX.Element = useMemo(() => (
    <TreeContext.Provider value={{
      expandedTreeState: expanded
        ? ExpandState.OPENED
        : ExpandState.CLOSED,
      maxDepth: depth as number,
    }}>
      {
        dataType === DataType.OBJECT || dataType === DataType.ARRAY
          ? (
            <div className={dataListItemsClass}>
              {getDataList(data, dataType, 1, computedKey)}
            </div>
          )
          : null
      }
    </TreeContext.Provider>
    // Prevents children from re-rendering when parent ExpandState is changed.
  ), [computedKey, data, dataListItemsClass, dataType, depth, expanded]);

  /**
   * Children nodes that may be hidden if depth is set
   */
  const NestedList: JSX.Element | null = useMemo(() => (dataType === DataType.OBJECT || dataType === DataType.ARRAY
    ? (
      <div className={dataListItemsClass}>
        {maxDepth !== 0 && currentDepth as number > maxDepth
          ? (<div>...</div>)
          : getDataList(data, dataType, currentDepth, computedKey)}
      </div>
    )
    : null
    // Prevents children from re-rendering when parent ExpandState is changed.
  ), [computedKey, currentDepth, data, dataListItemsClass, dataType, maxDepth]);

  return (
    <div className={dataTypeClass}>
      <span
        className={dataHandleClass}
        onClick={onHandleClick}
      >
        <span className="data__key">
          {objectKey}
        </span>
        <span className={dataValueClass()}>{dataValue}</span>
      </span>
      { currentDepth === undefined
        ? <>{ TopLevelList }</>
        : <>{ NestedList }</>}

    </div>
  );
};

ReactJsonPrint.defaultProps = {
  dataObject: null,
  dataString: undefined,
  objectKey: 'DATA',
  expanded: undefined,
  depth: 0,
  currentDepth: undefined,
  dataKey: undefined,
};

export default ReactJsonPrint;
