require 'minitest/autorun'
require 'open3'
require 'rbconfig'
require 'yaml'

class DeploymentEncodingTest < Minitest::Test
  ROOT = File.expand_path('../..', __dir__)
  READ_BIBLIOGRAPHY = <<~'RUBY'
    source = IO.read(ARGV.fetch(0))
    source.scan(/[[:alpha:]]/)
    abort 'Expected valid UTF-8 bibliography' unless source.encoding == Encoding::UTF_8 && source.valid_encoding?
    abort 'Expected non-ASCII regression data' if source.ascii_only?
  RUBY

  def read_bibliography(rubyopt)
    Open3.capture3(
      { 'LANG' => 'C', 'LC_ALL' => 'C', 'LANGUAGE' => 'C', 'RUBYOPT' => rubyopt },
      RbConfig.ruby, '-e', READ_BIBLIOGRAPHY, File.join(ROOT, '_bibliography/papers.bib')
    )
  end

  def test_deployment_reads_utf8_without_a_system_utf8_locale
    workflow = YAML.load_file(File.join(ROOT, '.github/workflows/deploy.yml'))
    rubyopt = workflow.fetch('jobs').fetch('build').fetch('env').fetch('RUBYOPT')
    stdout, stderr, status = read_bibliography(rubyopt)
    assert status.success?, "#{stdout}\n#{stderr}"
  end

  def test_ascii_reproduces_the_bibliography_failure
    _stdout, stderr, status = read_bibliography('-EUS-ASCII')
    refute status.success?
    assert_includes stderr, 'invalid byte sequence in US-ASCII'
  end
end
