# Ruby: Frozen String Literal

Adds the Ruby magic comment `# frozen_string_literal: true` automatically to your Ruby files.

## Features

This VS Code extension ensures that all your Ruby files include the `# frozen_string_literal: true` magic comment at the top of the file.

It works in two ways:

- ✅ **Automatic Insertion**:
  - Adds the comment **on file open** and **on save**.
  - Skips if the file already includes the comment.
  - Preserves existing shebangs (`#!/usr/bin/env ruby`) or encoding comments by inserting after them.

- 🔧 **Manual Command**:
  - Use the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`) and run:

    ```
    Ruby: Add `# frozen_string_literal: true`
    ```
  - The manual command works on any file. If it's not a Ruby file, you'll be prompted with an option to insert the comment anyway.

## Extension Settings

You can disable the automatic behavior and use the manual command only:

```json
"frozenStringLiteralRuby.enableAutoInsert": false
```

---

## Examples

### First example:
Given a file like this:
```ruby
puts 'hello world'
```

The extension should update it to this:
```ruby
# frozen_string_literal: true

puts 'hello world'
```


### Second example:
Given a file like this:
```ruby
#!/usr/bin/env ruby
# encoding: utf-8

puts 'hello world'
```

The extension should update it to this:
```ruby
#!/usr/bin/env ruby
# encoding: utf-8
# frozen_string_literal: true

puts 'hello world'
```
---

## Installation

Search for Frozen String Literal Ruby in the Extensions panel in VS Code and install it.
