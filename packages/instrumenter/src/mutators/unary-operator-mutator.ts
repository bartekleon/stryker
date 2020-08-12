import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

interface UnaryOperators {
  '+': '-';
  '-': '+';
  '~': '';
}

export class UnaryOperatorMutator implements NodeMutator {
  public name = 'UnaryOperator';

  private readonly operators: UnaryOperators = {
    '+': '-',
    '-': '+',
    '~': '',
  };

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isUnaryExpression() && this.isSupported(path.node.operator) && path.node.prefix) {
      return this.operators[path.node.operator].length > 0
        ? [
            {
              original: path.node,
              replacement: types.unaryExpression(this.operators[path.node.operator] as any, path.node.argument),
            },
          ]
        : [
            {
              original: path.node,
              replacement: types.cloneNode(path.node.argument, false),
            },
          ];
    }

    return [];
  }

  private isSupported(operator: string): operator is keyof UnaryOperators {
    return Object.keys(this.operators).includes(operator);
  }
}
