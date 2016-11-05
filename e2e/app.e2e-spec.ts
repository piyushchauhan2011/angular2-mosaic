import { MosaicPage } from './app.po';

describe('mosaic App', function() {
  let page: MosaicPage;

  beforeEach(() => {
    page = new MosaicPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
