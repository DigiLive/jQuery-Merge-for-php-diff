describe 'phpdiffmerge', ->

  plugin = null
  instance = null
  $fixture = null

  beforeEach ->
    plugin = $.fn.phpdiffmerge
    $fixture = $('<table class="Differences DifferencesSideBySide"><thead><tr><th colspan="2">Old Version</th><th colspan="2">New Version</th></tr></thead><tbody class="ChangeEqual"><tr><th>1</th><td class="Left"><span>&lt;html&gt;</span>&nbsp;</span></td><th>1</th><td class="Right"><span>&lt;html&gt;</span>&nbsp;</span></td></tr><tr><th>2</th><td class="Left"><span>&nbsp; &nbsp;&lt;head&gt;</span>&nbsp;</span></td><th>2</th><td class="Right"><span>&nbsp; &nbsp;&lt;head&gt;</span>&nbsp;</span></td></tr><tr><th>3</th><td class="Left"><span>&nbsp; &nbsp; &nbsp; &nbsp;&lt;meta http-equiv="Content-type" content="text/html; charset=utf-8"/&gt;</span>&nbsp;</span></td><th>3</th><td class="Right"><span>&nbsp; &nbsp; &nbsp; &nbsp;&lt;meta http-equiv="Content-type" content="text/html; charset=utf-8"/&gt;</span>&nbsp;</span></td></tr></tbody><tbody class="ChangeReplace"><tr><th>4</th><td class="Left"><span>&nbsp; &nbsp; &nbsp; &nbsp;&lt;title&gt;<del>Hello</del> World!&lt;/title&gt;</span>&nbsp;</td><th>4</th><td class="Right"><span>&nbsp; &nbsp; &nbsp; &nbsp;&lt;title&gt;<ins>Goodbye Cruel</ins> World!&lt;/title&gt;</span></td></tr></tbody><tbody class="ChangeEqual"><tr><th>5</th><td class="Left"><span>&nbsp; &nbsp;&lt;/head&gt;</span>&nbsp;</span></td><th>5</th><td class="Right"><span>&nbsp; &nbsp;&lt;/head&gt;</span>&nbsp;</span></td></tr><tr><th>6</th><td class="Left"><span>&nbsp; &nbsp;&lt;body&gt;</span>&nbsp;</span></td><th>6</th><td class="Right"><span>&nbsp; &nbsp;&lt;body&gt;</span>&nbsp;</span></td></tr><tr><th>7</th><td class="Left"><span>&nbsp; &nbsp; &nbsp; &nbsp;&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&lt;/p&gt;</span>&nbsp;</span></td><th>7</th><td class="Right"><span>&nbsp; &nbsp; &nbsp; &nbsp;&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&lt;/p&gt;</span>&nbsp;</span></td></tr><tr><th>8</th><td class="Left"><span></span>&nbsp;</span></td><th>8</th><td class="Right"><span></span>&nbsp;</span></td></tr></tbody><tbody class="ChangeDelete"><tr><th>9</th><td class="Left"><del>&nbsp; &nbsp; &nbsp; &nbsp;&lt;h2&gt;A heading we\'ll be removing&lt;/h2&gt;</del>&nbsp;</td><th>&nbsp;</th><td class="Right">&nbsp;</td></tr></tbody><tbody class="ChangeEqual"><tr><th>10</th><td class="Left"><span></span>&nbsp;</span></td><th>9</th><td class="Right"><span></span>&nbsp;</span></td></tr><tr><th>11</th><td class="Left"><span>&nbsp; &nbsp; &nbsp; &nbsp;&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&lt;/p&gt;</span>&nbsp;</span></td><th>10</th><td class="Right"><span>&nbsp; &nbsp; &nbsp; &nbsp;&lt;p&gt;Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.&lt;/p&gt;</span>&nbsp;</span></td></tr></tbody><tbody class="ChangeInsert"><tr><th>&nbsp;</th><td class="Left">&nbsp;</td><th>11</th><td class="Right"><ins></ins>&nbsp;</td></tr><tr><th>&nbsp;</th><td class="Left">&nbsp;</td><th>12</th><td class="Right"><ins>&nbsp; &nbsp; &nbsp; &nbsp;&lt;p&gt;Just a small amount of new text...&lt;/p&gt;</ins>&nbsp;</td></tr></tbody><tbody class="ChangeEqual"><tr><th>12</th><td class="Left"><span>&nbsp; &nbsp;&lt;/body&gt;</span>&nbsp;</span></td><th>13</th><td class="Right"><span>&nbsp; &nbsp;&lt;/body&gt;</span>&nbsp;</span></td></tr><tr><th>13</th><td class="Left"><span>&lt;/html&gt;</span>&nbsp;</span></td><th>14</th><td class="Right"><span>&lt;/html&gt;</span>&nbsp;</span></td></tr></tbody></table>');
    instance = $fixture.phpdiffmerge().data('plugin_phpdiffmerge')


  it 'should exist', ->
    expect(typeof plugin).toBe 'function'
    expect(typeof instance).toBe 'object'
    expect(instance._name).toBe 'phpdiffmerge'

  it 'should not overwrite itself', ->
    expect($fixture.phpdiffmerge().data('plugin_phpdiffmerge')).toBe instance

  it 'should re-init when called with new options', ->
    spyOn instance, '_init'
    $fixture.phpdiffmerge debug: true
    expect(instance._init).toHaveBeenCalled()

  describe 'methods', ->
    beforeEach ->
      $fixture.phpdiffmerge

    it 'should have callable methods', ->
      method = 'useLeft'
      spyOn instance, method
      $fixture.phpdiffmerge method
      expect(instance.useLeft).toHaveBeenCalled()