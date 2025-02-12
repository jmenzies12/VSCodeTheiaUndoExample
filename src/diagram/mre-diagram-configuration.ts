import {
  DefaultTypes,
  DiagramConfiguration,
  getDefaultMapping,
  GModelElement,
  GModelElementConstructor,
  ServerLayoutKind,
  ShapeTypeHint,
  EdgeTypeHint
} from "@eclipse-glsp/server";
import { injectable } from "inversify";

@injectable()
export class MREDiagramConfiguration implements DiagramConfiguration {
  layoutKind = ServerLayoutKind.MANUAL;
  needsClientLayout = true;
  animatedUpdate = true;

  get typeMapping(): Map<string, GModelElementConstructor<GModelElement>> {
    const defaultMappings = getDefaultMapping();
    return defaultMappings;
  }

  get shapeTypeHints(): ShapeTypeHint[] {
    return [
      {
        elementTypeId: DefaultTypes.NODE,
        deletable: true,
        reparentable: false,
        repositionable: true,
        resizable: true,
      },
    ];
  }

  get edgeTypeHints(): EdgeTypeHint[] {
		return []
	}
}
