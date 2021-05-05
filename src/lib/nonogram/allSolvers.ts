import pushSolver from './solvers/pushSolver';
import bruteForceSolver from './solvers/bruteForceSolver';
/**
 * all solvers in descending order by speed
 */
export default [pushSolver.solve, bruteForceSolver.solve];
