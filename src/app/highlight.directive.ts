import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {
  @Input('appHighlight') isSelected: boolean = false;
  @Input('appColor') orginalColor!: string;

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
      '#2383D1'
    );
    this.renderer.setStyle(this.el.nativeElement, 'color', '#ffffff');

    this.highlightIconBorder();
  }

  private removeHighlight(): void {
    this.renderer.removeStyle(this.el.nativeElement, 'background-color');
    this.renderer.removeStyle(this.el.nativeElement, 'color');

    this.changeBackIconBorder();
  }

  private highlightIconBorder(): void {
    const iconWrapper = this.el.nativeElement.querySelector('.iconWrapper');
    this.renderer.setStyle(iconWrapper, 'border-color', '#ffffff');
  }

  private changeBackIconBorder(): void {
    const iconWrapper = this.el.nativeElement.querySelector('.iconWrapper');
    this.renderer.setStyle(iconWrapper, 'border-color', this.orginalColor);
  }
}
