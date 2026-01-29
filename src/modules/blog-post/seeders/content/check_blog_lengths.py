import os
import glob

content_dir = '/config/Desktop/gat/portfolio/src/modules/blog-post/seeders/content/'
target_files = [
    'api-gateway-enterprise.md',
    'bff-pattern.md',
    'event-driven-nestjs.md',
    'nodejs-performance-tuning.md',
    'cloud-native-disaster-recovery.md',
    'cicd-gitops.md',
    'rag-architecture-langchain.md',
    'postgresql-read-replicas-drizzle.md',
    'advanced-security-auth.md',
    'aws-vpc-lattice-microservices.md',
    'serverless-orchestration-aws.md',
    'langchain-agent-scalability.md',
    'zero-downtime-migrations.md'
]

print(f"{'File':<40} | {'Lines':<5} | {'Bytes':<10} | {'Status'}")
print("-" * 75)

for filename in target_files:
    filepath = os.path.join(content_dir, filename)
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            lines = len(content.splitlines())
            size = len(content.encode('utf-8'))
            status = "OK" if size > 3000 else "FAIL (< 3000 chars)"
            print(f"{filename:<40} | {lines:<5} | {size:<10} | {status}")
    except FileNotFoundError:
        print(f"{filename:<40} | {'MISSING':<5} | {'-':<10} | ERROR")

