import React, { Component } from "react";
import Node from "./Node/Node";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";

import "./PathFinderVisualizer.css";

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      isSelectingStart: false,
      isSelectingFinish: false,
      startNode: { row: 10, col: 15 },
      finishNode: { row: 10, col: 35 },
    };
  }

  componentDidMount() {
    const grid = getInitialGrid(this.state.startNode, this.state.finishNode);
    this.setState({ grid });
  }

  handleMouseDown(row, col) {
    const { isSelectingStart, isSelectingFinish } = this.state;
    if (isSelectingStart) {
      this.setStartNode(row, col);
    } else if (isSelectingFinish) {
      this.setFinishNode(row, col);
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  setStartNode(row, col) {
    const { finishNode } = this.state;
    if (row === finishNode.row && col === finishNode.col) return;
    const newGrid = getInitialGrid({ row, col }, finishNode);
    this.setState({
      grid: newGrid,
      isSelectingStart: false,
      startNode: { row, col },
    });
  }

  setFinishNode(row, col) {
    const { startNode } = this.state;
    if (row === startNode.row && col === startNode.col) return;
    const newGrid = getInitialGrid(startNode, { row, col });
    this.setState({
      grid: newGrid,
      isSelectingFinish: false,
      finishNode: { row, col },
    });
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    const { grid, startNode, finishNode } = this.state;
    const start = grid[startNode.row][startNode.col];
    const finish = grid[finishNode.row][finishNode.col];
    const visitedNodesInOrder = dijkstra(grid, start, finish);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finish);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  refreshPage() {
    window.location.reload();
  }

  render() {
    const { grid, mouseIsPressed } = this.state;

    return (
      <>
        <div className="button-container">
          <button onClick={() => this.setState({ isSelectingStart: true })}>
            Set Start Node
          </button>
          <button onClick={() => this.setState({ isSelectingFinish: true })}>
            Set Finish Node
          </button>
          <button onClick={() => this.visualizeDijkstra()}>
            Visualize Dijkstra's Algorithm
          </button>
          <button onClick={() => this.refreshPage()}>Refresh Page</button>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx} className="grid-row">
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = (startNode, finishNode) => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row, startNode, finishNode));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row, startNode, finishNode) => {
  return {
    col,
    row,
    isStart: row === startNode.row && col === startNode.col,
    isFinish: row === finishNode.row && col === finishNode.col,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
