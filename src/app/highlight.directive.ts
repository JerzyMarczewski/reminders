import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {
  @Input('appHighlight') isSelected: boolean = false;
  @Input('appColor') orginalColor!: string;

  private readonly defaultColor = '#FAF9F6';
  private readonly highlightColor = '#2E8DDC';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    if (this.isSelected) {
      this.highlight();
    } else {
      this.removeHighlight();
    }
  }

  private highlight(): void {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      this.highlightColor
    );
    this.renderer.setStyle(this.el.nativeElement, 'color', this.defaultColor);

    this.highlightIconBorder();
  }

  private removeHighlight(): void {
    this.renderer.removeStyle(this.el.nativeElement, 'background-color');
    this.renderer.removeStyle(this.el.nativeElement, 'color');

    this.changeBackIconBorder();
  }

  private highlightIconBorder(): void {
    const iconWrapper = this.el.nativeElement.querySelector('.iconWrapper');
    this.renderer.setStyle(iconWrapper, 'border-color', this.defaultColor);
  }

  private changeBackIconBorder(): void {
    const iconWrapper = this.el.nativeElement.querySelector('.iconWrapper');
    this.renderer.setStyle(iconWrapper, 'border-color', this.orginalColor);
  }
}
